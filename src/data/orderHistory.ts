export interface OrderRecord {
  patient_id: string;
  patient_age: number;
  patient_gender: string;
  purchase_date: string;
  product_name: string;
  quantity: number;
  total_price: number;
  dosage_frequency: string;
  prescription_required: boolean;
}

export const orderHistory: OrderRecord[] = [
  { patient_id: "PAT004", patient_age: 55, patient_gender: "M", purchase_date: "2024-03-13", product_name: "Mucosolvan Retardkapseln", quantity: 1, total_price: 39.97, dosage_frequency: "Once daily", prescription_required: true },
  { patient_id: "PAT006", patient_age: 71, patient_gender: "M", purchase_date: "2024-03-09", product_name: "Ramipril 10 mg Tabletten", quantity: 2, total_price: 25.18, dosage_frequency: "Once daily", prescription_required: true },
  { patient_id: "PAT008", patient_age: 42, patient_gender: "M", purchase_date: "2024-03-08", product_name: "Minoxidil Spray", quantity: 1, total_price: 22.50, dosage_frequency: "Twice daily", prescription_required: true },
  { patient_id: "PAT016", patient_age: 53, patient_gender: "F", purchase_date: "2024-02-24", product_name: "femiLoges Tabletten", quantity: 1, total_price: 20.44, dosage_frequency: "Once daily", prescription_required: true },
  { patient_id: "PAT020", patient_age: 60, patient_gender: "M", purchase_date: "2024-02-19", product_name: "COLPOFIX Vaginalgel", quantity: 1, total_price: 49.60, dosage_frequency: "As needed", prescription_required: true },
  { patient_id: "PAT002", patient_age: 62, patient_gender: "M", purchase_date: "2024-02-01", product_name: "Aqualibra Filmtabletten", quantity: 1, total_price: 27.82, dosage_frequency: "Twice daily", prescription_required: true },
  { patient_id: "PAT034", patient_age: 48, patient_gender: "M", purchase_date: "2024-01-28", product_name: "Livocab direkt Augentropfen", quantity: 1, total_price: 14.99, dosage_frequency: "Twice daily", prescription_required: true },
  { patient_id: "PAT001", patient_age: 35, patient_gender: "F", purchase_date: "2024-03-01", product_name: "Paracetamol 500 mg", quantity: 2, total_price: 4.12, dosage_frequency: "As needed", prescription_required: false },
  { patient_id: "PAT001", patient_age: 35, patient_gender: "F", purchase_date: "2024-02-15", product_name: "Magnesium Verla N Dragées", quantity: 1, total_price: 6.40, dosage_frequency: "Once daily", prescription_required: false },
  { patient_id: "PAT003", patient_age: 28, patient_gender: "F", purchase_date: "2024-03-05", product_name: "Cetirizin HEXAL Tropfen", quantity: 1, total_price: 13.19, dosage_frequency: "Once daily", prescription_required: false },
  { patient_id: "PAT005", patient_age: 45, patient_gender: "M", purchase_date: "2024-02-20", product_name: "Vigantolvit 2000 I.E. Vitamin D3", quantity: 1, total_price: 17.99, dosage_frequency: "Once daily", prescription_required: false },
  { patient_id: "PAT005", patient_age: 45, patient_gender: "M", purchase_date: "2024-01-10", product_name: "NORSAN Omega-3 Total", quantity: 1, total_price: 27.00, dosage_frequency: "Once daily", prescription_required: false },
  { patient_id: "PAT007", patient_age: 38, patient_gender: "F", purchase_date: "2024-03-10", product_name: "Kijimea Reizdarm PRO", quantity: 1, total_price: 38.99, dosage_frequency: "Once daily", prescription_required: false },
  { patient_id: "PAT009", patient_age: 65, patient_gender: "M", purchase_date: "2024-02-28", product_name: "Diclo-ratiopharm Schmerzgel", quantity: 2, total_price: 17.78, dosage_frequency: "Three times daily", prescription_required: false },
  { patient_id: "PAT010", patient_age: 50, patient_gender: "F", purchase_date: "2024-01-15", product_name: "DulcoLax Dragées", quantity: 1, total_price: 22.90, dosage_frequency: "As needed", prescription_required: false },
  { patient_id: "PAT006", patient_age: 71, patient_gender: "M", purchase_date: "2024-01-09", product_name: "Ramipril 10 mg Tabletten", quantity: 2, total_price: 25.18, dosage_frequency: "Once daily", prescription_required: true },
  { patient_id: "PAT004", patient_age: 55, patient_gender: "M", purchase_date: "2024-01-13", product_name: "Mucosolvan Retardkapseln", quantity: 1, total_price: 39.97, dosage_frequency: "Once daily", prescription_required: true },
];

export const patients = [...new Set(orderHistory.map(o => o.patient_id))].sort();

export function getRefillPredictions() {
  const now = new Date();
  const predictions: Array<{
    patient_id: string;
    product_name: string;
    last_purchase: string;
    days_since: number;
    estimated_supply_days: number;
    urgency: 'critical' | 'warning' | 'ok';
    dosage_frequency: string;
  }> = [];

  const patientProducts = new Map<string, OrderRecord[]>();
  orderHistory.forEach(o => {
    const key = `${o.patient_id}|${o.product_name}`;
    if (!patientProducts.has(key)) patientProducts.set(key, []);
    patientProducts.get(key)!.push(o);
  });

  patientProducts.forEach((orders, key) => {
    const [patient_id, product_name] = key.split('|');
    const latest = orders.sort((a, b) => new Date(b.purchase_date).getTime() - new Date(a.purchase_date).getTime())[0];
    const daysSince = Math.floor((now.getTime() - new Date(latest.purchase_date).getTime()) / (1000 * 60 * 60 * 24));

    let supplyDays = 30;
    if (latest.dosage_frequency === 'Once daily') supplyDays = 30;
    else if (latest.dosage_frequency === 'Twice daily') supplyDays = 15;
    else if (latest.dosage_frequency === 'Three times daily') supplyDays = 10;
    else supplyDays = 60;

    const daysLeft = supplyDays - (daysSince % supplyDays);
    let urgency: 'critical' | 'warning' | 'ok' = 'ok';
    if (daysLeft <= 5) urgency = 'critical';
    else if (daysLeft <= 15) urgency = 'warning';

    predictions.push({
      patient_id,
      product_name,
      last_purchase: latest.purchase_date,
      days_since: daysSince,
      estimated_supply_days: supplyDays,
      urgency,
      dosage_frequency: latest.dosage_frequency,
    });
  });

  return predictions.sort((a, b) => {
    const urgencyOrder = { critical: 0, warning: 1, ok: 2 };
    return urgencyOrder[a.urgency] - urgencyOrder[b.urgency];
  });
}

export function getDiseaseMatrix() {
  const categoryPatients = new Map<string, Set<string>>();
  const ageGroups = ['18-30', '31-45', '46-60', '61+'];

  orderHistory.forEach(o => {
    // Map products to disease categories
    const category = getDiseaseCategoryFromProduct(o.product_name);
    if (!categoryPatients.has(category)) categoryPatients.set(category, new Set());
    categoryPatients.get(category)!.add(o.patient_id);
  });

  return Array.from(categoryPatients.entries()).map(([category, patientSet]) => {
    const patients = Array.from(patientSet);
    const ageDistribution: Record<string, number> = {};
    ageGroups.forEach(g => ageDistribution[g] = 0);

    patients.forEach(pid => {
      const record = orderHistory.find(o => o.patient_id === pid);
      if (record) {
        const age = record.patient_age;
        if (age <= 30) ageDistribution['18-30']++;
        else if (age <= 45) ageDistribution['31-45']++;
        else if (age <= 60) ageDistribution['46-60']++;
        else ageDistribution['61+']++;
      }
    });

    return { category, patient_count: patients.length, ageDistribution };
  });
}

function getDiseaseCategoryFromProduct(name: string): string {
  const lower = name.toLowerCase();
  if (lower.includes('ramipril')) return 'Hypertension';
  if (lower.includes('paracetamol') || lower.includes('nurofen') || lower.includes('diclo')) return 'Pain/Inflammation';
  if (lower.includes('mucosolvan') || lower.includes('sinupret')) return 'Respiratory';
  if (lower.includes('cetirizin') || lower.includes('livocab') || lower.includes('vividrin')) return 'Allergies';
  if (lower.includes('kijimea') || lower.includes('dulcolax') || lower.includes('loperamid')) return 'Digestive Issues';
  if (lower.includes('omega') || lower.includes('vitamin') || lower.includes('magnesium')) return 'Nutritional Deficiency';
  if (lower.includes('minoxidil')) return 'Hair Loss';
  if (lower.includes('femiloge') || lower.includes('colpofix')) return "Women's Health";
  if (lower.includes('aqualibra') || lower.includes('cystinol')) return 'Urinary Issues';
  return 'General Health';
}
