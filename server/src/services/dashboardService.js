import supabase from "../config/supabase.js";

export const getDashboardData = async () => {
  // Fetch all basic entities
  const { data: drugs, error: drugsError } = await supabase.from("drugs").select("*");
  if (drugsError) throw drugsError;

  const { data: shipments, error: shipmentsError } = await supabase
    .from("shipments")
    .select(`
      *,
      drugs ( name ),
      vendors ( name ),
      hospitals ( name )
    `);

  if (shipmentsError) throw shipmentsError;

  // Process Drugs and add status
  let criticalDrugsCount = 0;
  let lowStockDrugsCount = 0;

  const processedDrugs = drugs.map((drug) => {
    let status = "HEALTHY";
    if (drug.current_stock <= drug.minimum_stock) {
      status = "CRITICAL";
      criticalDrugsCount++;
      lowStockDrugsCount++;
    } else if (drug.current_stock <= drug.minimum_stock * 1.25) {
      status = "WARNING";
      lowStockDrugsCount++;
    }

    return {
      ...drug,
      status,
    };
  });

  // Process Alerts/Exceptions
  const alerts = [];

  processedDrugs.forEach(drug => {
    if (drug.status === 'CRITICAL') {
      alerts.push({
        type: 'LOW_STOCK',
        severity: 'CRITICAL',
        title: `${drug.name} below minimum stock`,
        description: `Current stock ${drug.current_stock} / minimum ${drug.minimum_stock}`,
        related_drug: drug.name,
      });
    } else if (drug.status === 'WARNING') {
      alerts.push({
        type: 'LOW_STOCK',
        severity: 'WARNING',
        title: `${drug.name} approaching minimum stock`,
        description: `Current stock ${drug.current_stock} / minimum ${drug.minimum_stock}`,
        related_drug: drug.name,
      });
    }
  });

  let activeShipmentsCount = 0;
  let delayedShipmentsCount = 0;

  const processedShipments = shipments.map(shipment => {
    const drugName = shipment.drugs?.name || shipment.drug;
    const vendorName = shipment.vendors?.name || shipment.vendor;
    const hospitalName = shipment.hospitals?.name || shipment.hospital;

    const formattedShipment = {
      ...shipment,
      drug_name: drugName,
      vendor_name: vendorName,
      hospital_name: hospitalName
    };

    if (shipment.status === 'IN_TRANSIT') {
      activeShipmentsCount++;
    } else if (shipment.status === 'DELAYED') {
      delayedShipmentsCount++;
      alerts.push({
        type: 'DELAYED_SHIPMENT',
        severity: 'WARNING',
        title: `${drugName} shipment delayed`,
        description: `Shipment from ${vendorName} is delayed.`,
        related_drug: drugName,
        related_shipment: shipment.id
      });
    }

    if (shipment.quantity < shipment.expected_quantity) {
      alerts.push({
        type: 'QUANTITY_MISMATCH',
        severity: 'WARNING',
        title: `${drugName} shipment quantity mismatch`,
        description: `Expected ${shipment.expected_quantity} / received ${shipment.quantity}`,
        related_drug: drugName,
        related_shipment: shipment.id
      });
    }

    if (shipment.temperature && shipment.temperature > 8) {
      alerts.push({
        type: 'COLD_CHAIN_VIOLATION',
        severity: 'CRITICAL',
        title: `${drugName} shipment temperature violation`,
        description: `Recorded temperature ${shipment.temperature}°C`,
        related_drug: drugName,
        related_shipment: shipment.id
      });
    }

    return formattedShipment;
  });

  return {
    summary: {
      totalDrugs: drugs.length,
      lowStockDrugs: lowStockDrugsCount,
      criticalDrugs: criticalDrugsCount,
      activeShipments: activeShipmentsCount,
      delayedShipments: delayedShipmentsCount,
      totalExceptions: alerts.length
    },
    inventory: processedDrugs,
    shipments: processedShipments,
    alerts: alerts
  };
};