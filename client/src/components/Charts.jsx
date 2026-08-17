import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

export function DrugStatusChart({ inventory }) {
  const data = [
    { name: 'Healthy', value: inventory.filter(d => d.status === 'HEALTHY').length, color: '#10b981' },
    { name: 'Warning', value: inventory.filter(d => d.status === 'WARNING').length, color: '#f59e0b' },
    { name: 'Critical', value: inventory.filter(d => d.status === 'CRITICAL').length, color: '#ef4444' },
  ].filter(d => d.value > 0);

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip 
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ShipmentStatusChart({ shipments }) {
  const data = [
    { name: 'Delivered', value: shipments.filter(s => s.status === 'DELIVERED').length, fill: '#3b82f6' },
    { name: 'In Transit', value: shipments.filter(s => s.status === 'IN_TRANSIT').length, fill: '#8b5cf6' },
    { name: 'Delayed', value: shipments.filter(s => s.status === 'DELAYED').length, fill: '#ef4444' },
  ];

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
          <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#64748b' }} />
          <Tooltip 
            cursor={{ fill: '#f8fafc' }}
            contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
          />
          <Bar dataKey="value" radius={[4, 4, 0, 0]} barSize={40} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
