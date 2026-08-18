import supabase from "../config/supabase.js";
import { DecisionTreeClassifier } from "ml-cart";

const trainMLModel = (drugs) => {
  // Synthesize training data based on logical heuristics
  // Features: [stockRatio, daysUntilStockout]
  const X = [];
  const y = []; // 0: INFO, 1: WARNING, 2: CRITICAL

  drugs.forEach((drug) => {
    const stockRatio = drug.current_stock / (drug.minimum_stock || 1);
    const dailyUsage = drug.average_daily_usage || 1;
    const daysUntilStockout = dailyUsage > 0 ? drug.current_stock / dailyUsage : 100;
    
    let label = 0; // INFO/SAFE
    if (stockRatio <= 1.0 || daysUntilStockout <= 7) {
      label = 2; // CRITICAL
    } else if (stockRatio <= 1.5 || daysUntilStockout <= 14) {
      label = 1; // WARNING
    }
    
    X.push([stockRatio, Math.min(daysUntilStockout / 30, 1)]); // Normalize days to 0-1
    y.push(label);
  });

  const classifier = new DecisionTreeClassifier({
    maxDepth: 4,
  });
  
  if (X.length > 0) {
    try {
      classifier.train(X, y);
    } catch (e) {
      console.error("ML model training error:", e);
      // Fallback classifier - if training fails, use heuristics
    }
  }
  
  return classifier;
};

const predictStockRisk = (classifier, drug) => {
  try {
    const stockRatio = drug.current_stock / (drug.minimum_stock || 1);
    const dailyUsage = drug.average_daily_usage || 1;
    const daysUntilStockout = dailyUsage > 0 ? drug.current_stock / dailyUsage : 100;
    
    const prediction = classifier.predict([[stockRatio, Math.min(daysUntilStockout / 30, 1)]])[0];
    return prediction;
  } catch (e) {
    // Fallback: use simple heuristics if prediction fails
    const stockRatio = drug.current_stock / (drug.minimum_stock || 1);
    if (stockRatio <= 1.0) return 2; // CRITICAL
    if (stockRatio <= 1.5) return 1; // WARNING
    return 0; // INFO
  }
};

export const getAlerts = async (hospitalId) => {
  const alerts = [];

  try {
    // Fetch Drugs
    const { data: drugs, error: drugsError } = await supabase
      .from("drugs")
      .select("*");
      
    if (drugsError) throw drugsError;

    // AI Stock Alerts using Decision Tree
    const classifier = trainMLModel(drugs);

    drugs.forEach((drug) => {
  const stockRatio =
    drug.current_stock / (drug.minimum_stock || 1);

  const dailyUsage =
    drug.average_daily_usage || 1;

  const daysUntilStockout =
    dailyUsage > 0
      ? drug.current_stock / dailyUsage
      : 100;

  // Predict using ML model
  const prediction = predictStockRisk(classifier, drug);

  if (prediction === 2) {
    const reorderQty = Math.ceil(
      (drug.minimum_stock *
        (drug.lead_time_days ? drug.lead_time_days : 7)) /
        7
    );

    alerts.push({
      id: `stock-crit-${drug.id}`,
      category: "AI Stock Alerts",
      severity: "CRITICAL",
      title: `Predicted Stockout Risk: ${drug.name}`,

      description: `Current stock (${drug.current_stock} units) is critically low. Minimum threshold: ${drug.minimum_stock}.`,

      recommendation: `Reorder ${reorderQty} units immediately. Lead time: ${drug.lead_time_days || 7} days.`,

      date: new Date().toISOString(),
      related_drug: drug.name,
    });
  } else if (prediction === 1) {
    const reorderQty = Math.ceil(
      drug.minimum_stock * 1.5
    );

    alerts.push({
      id: `stock-warn-${drug.id}`,
      category: "AI Stock Alerts",
      severity: "WARNING",
      title: `Low Stock Warning: ${drug.name}`,

      description: `Current stock (${drug.current_stock} units) is approaching minimum threshold (${drug.minimum_stock}).`,

      recommendation: `Consider reordering ${reorderQty} units to maintain safety buffer.`,

      date: new Date().toISOString(),
      related_drug: drug.name,
    });
  }
});

    // Fetch Shipments
    let shipmentQuery = supabase.from("shipments").select(`
      *,
      drugs ( name ),
      vendors ( name ),
      hospitals ( name )
    `);
    
    if (hospitalId) {
      shipmentQuery = shipmentQuery.eq("hospital_id", hospitalId);
    }

    const { data: shipments, error: shipmentsError } = await shipmentQuery;
    
    if (shipmentsError) throw shipmentsError;

    shipments.forEach((shipment) => {
      const drugName = shipment.drugs?.name || shipment.drug;
      
      // Delayed Shipment
      if (shipment.status === "DELAYED") {
        alerts.push({
          id: `ship-delay-${shipment.id}`,
          category: "Shipment/Delivery Alerts",
          severity: "WARNING",
          title: `Delayed Shipment: ${drugName}`,
          description: `Shipment from ${shipment.vendors?.name} is delayed. Expected delivery was ${new Date(shipment.expected_delivery).toLocaleDateString()}.`,
          date: shipment.created_at || new Date().toISOString(),
          related_drug: drugName,
        });
      }

      // Expected Delivery Date Passed (and not delivered)
      if (shipment.status === "IN_TRANSIT" && new Date(shipment.expected_delivery) < new Date()) {
         alerts.push({
          id: `ship-overdue-${shipment.id}`,
          category: "Shipment/Delivery Alerts",
          severity: "WARNING",
          title: `Overdue Shipment: ${drugName}`,
          description: `Shipment from ${shipment.vendors?.name} is overdue. Expected delivery: ${new Date(shipment.expected_delivery).toLocaleDateString()}.`,
          date: new Date().toISOString(),
          related_drug: drugName,
        });
      }

      // Shipment Delivered
      if (shipment.status === "DELIVERED") {
        // Check if it was delivered recently (e.g., within last 7 days)
        const isRecent = new Date(shipment.actual_delivery || shipment.created_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
        if (isRecent) {
          alerts.push({
            id: `ship-deliv-${shipment.id}`,
            category: "Shipment/Delivery Alerts",
            severity: "INFO",
            title: `Shipment Delivered: ${drugName}`,
            description: `Received ${shipment.quantity} units from ${shipment.vendors?.name} on ${new Date(shipment.actual_delivery || shipment.created_at).toLocaleDateString()}.`,
            date: shipment.actual_delivery || shipment.created_at || new Date().toISOString(),
            related_drug: drugName,
          });
        }
      }

      // Quantity Mismatch
      if (shipment.status === "DELIVERED" && shipment.quantity < shipment.expected_quantity) {
        const shortfall = shipment.expected_quantity - shipment.quantity;
        alerts.push({
          id: `ship-quant-${shipment.id}`,
          category: "Shipment/Delivery Alerts",
          severity: "WARNING",
          title: `Quantity Mismatch: ${drugName}`,
          description: `Expected ${shipment.expected_quantity} units but received ${shipment.quantity} units. Shortfall: ${shortfall} units.`,
          recommendation: `Follow up with ${shipment.vendors?.name} regarding the missing ${shortfall} units.`,
          date: shipment.actual_delivery || shipment.created_at || new Date().toISOString(),
          related_drug: drugName,
        });
      }

      // Temperature Issue
      if (shipment.temperature !== null && (shipment.temperature < 2 || shipment.temperature > 8)) {
        alerts.push({
          id: `ship-temp-${shipment.id}`,
          category: "Shipment/Delivery Alerts",
          severity: "CRITICAL",
          title: `Temperature Violation: ${drugName}`,
          description: `Shipment recorded a temperature of ${shipment.temperature}°C, outside the safe 2-8°C range. Cold chain integrity may be compromised.`,
          recommendation: `Inspect shipment immediately and document condition. Consider quarantine pending quality assessment.`,
          date: shipment.created_at || new Date().toISOString(),
          related_drug: drugName,
        });
      }

      // Reported Shipment Issue (if field exists)
      if (shipment.issue_reported || shipment.issues) {
        const issueDesc = shipment.issues || shipment.issue_details || "Unknown issue reported";
        alerts.push({
          id: `ship-issue-${shipment.id}`,
          category: "Shipment/Delivery Alerts",
          severity: "WARNING",
          title: `Shipment Issue Reported: ${drugName}`,
          description: `Issue reported for shipment from ${shipment.vendors?.name}: ${issueDesc}`,
          date: shipment.created_at || new Date().toISOString(),
          related_drug: drugName,
        });
      }
    });

    // Fetch Shipment Requests (for Procurement Alerts)
    try {
      const { data: requests, error: requestsError } = await supabase
        .from("shipment_requests")
        .select(`
          *,
          drugs ( name ),
          hospitals ( name )
        `)
        .eq("status", "REQUESTED")
        .order("created_at", { ascending: true });

      if (!requestsError && requests && requests.length > 0) {
        // Alert for pending procurement requests older than 7 days
        requests.forEach((request) => {
          const daysOld = Math.floor((Date.now() - new Date(request.created_at).getTime()) / (1000 * 60 * 60 * 24));
          if (daysOld > 7) {
            const drugName = request.drugs?.name || 'Unknown Drug';
            alerts.push({
              id: `proc-pending-${request.id}`,
              category: "Procurement Alerts",
              severity: daysOld > 14 ? "CRITICAL" : "WARNING",
              title: `Pending Procurement Request: ${drugName}`,
              description: `Procurement request for ${drugName} has been pending for ${daysOld} days without acknowledgment.`,
              recommendation: `Follow up with procurement team or vendor to expedite this request.`,
              date: request.created_at || new Date().toISOString(),
              related_drug: drugName,
            });
          }
        });
      }
    } catch (e) {
      console.error("Error fetching shipment requests for procurement alerts:", e);
      // Continue without procurement alerts if fetch fails
    }

  } catch (error) {
    console.error("Error generating alerts:", error);
    // Return empty alerts array if critical error occurs
    return [];
  }

  return alerts.sort((a, b) => new Date(b.date) - new Date(a.date));
};
