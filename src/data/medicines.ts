export interface Medicine {
  product_id: number;
  product_name: string;
  pzn: string;
  price: number;
  package_size: string;
  description: string;
  stock_level: number;
  prescription_required: boolean;
  category: string;
}

export const medicines: Medicine[] = [
  { product_id: 16066, product_name: "Panthenol Spray", pzn: "04020784", price: 16.95, package_size: "130 g", description: "Skin healing foam spray", stock_level: 85, prescription_required: false, category: "Skin Care" },
  { product_id: 976308, product_name: "NORSAN Omega-3 Total", pzn: "13476520", price: 27.00, package_size: "200 ml", description: "Liquid Omega-3 oil for heart, brain & joints", stock_level: 42, prescription_required: false, category: "Supplements" },
  { product_id: 977179, product_name: "NORSAN Omega-3 Vegan", pzn: "13476394", price: 29.00, package_size: "100 ml", description: "Plant-based Omega-3 from algae", stock_level: 38, prescription_required: false, category: "Supplements" },
  { product_id: 993687, product_name: "NORSAN Omega-3 Kapseln", pzn: "13512730", price: 29.00, package_size: "120 st", description: "Daily Omega-3 capsules", stock_level: 55, prescription_required: false, category: "Supplements" },
  { product_id: 1225428, product_name: "Vividrin iso EDO Augentropfen", pzn: "16507327", price: 8.28, package_size: "30x0.5 ml", description: "Preservative-free anti-allergy eye drops", stock_level: 60, prescription_required: false, category: "Eye Care" },
  { product_id: 202796, product_name: "Aqualibra Filmtabletten", pzn: "00795287", price: 27.82, package_size: "60 st", description: "Herbal bladder support tablets", stock_level: 30, prescription_required: false, category: "Urinary Health" },
  { product_id: 1103035, product_name: "Vitasprint Pro Energie", pzn: "14050243", price: 15.95, package_size: "8 st", description: "B-vitamin energy supplement", stock_level: 70, prescription_required: false, category: "Supplements" },
  { product_id: 27955, product_name: "Cystinol akut", pzn: "07114824", price: 26.50, package_size: "60 st", description: "Herbal UTI treatment", stock_level: 45, prescription_required: false, category: "Urinary Health" },
  { product_id: 1162261, product_name: "Kijimea Reizdarm PRO", pzn: "15999676", price: 38.99, package_size: "28 st", description: "IBS symptom relief", stock_level: 25, prescription_required: false, category: "Digestive Health" },
  { product_id: 1204782, product_name: "Mucosolvan Retardkapseln", pzn: "15210915", price: 39.97, package_size: "50 st", description: "Long-acting cough mucus relief", stock_level: 18, prescription_required: true, category: "Respiratory" },
  { product_id: 1358905, product_name: "COLPOFIX Vaginalgel", pzn: "18389398", price: 49.60, package_size: "40 ml", description: "Cervical health vaginal gel", stock_level: 12, prescription_required: true, category: "Women's Health" },
  { product_id: 1329121, product_name: "Paracetamol 500 mg", pzn: "18188323", price: 2.06, package_size: "20 st", description: "Pain and fever relief tablets", stock_level: 200, prescription_required: false, category: "Pain Relief" },
  { product_id: 202006, product_name: "Ramipril 10 mg Tabletten", pzn: "00766794", price: 12.59, package_size: "20 st", description: "Blood pressure medication (prescription)", stock_level: 35, prescription_required: true, category: "Cardiovascular" },
  { product_id: 772646, product_name: "Minoxidil Spray", pzn: "10391763", price: 22.50, package_size: "60 ml", description: "Hair loss treatment spray", stock_level: 28, prescription_required: true, category: "Hair Care" },
  { product_id: 1248085, product_name: "femiLoges Tabletten", pzn: "16815862", price: 20.44, package_size: "30 st", description: "Hormone-free menopause relief", stock_level: 40, prescription_required: true, category: "Women's Health" },
  { product_id: 335765, product_name: "Nurofen 200 mg Schmelztabletten", pzn: "02547582", price: 10.98, package_size: "12 st", description: "Fast-dissolving ibuprofen pain relief", stock_level: 150, prescription_required: false, category: "Pain Relief" },
  { product_id: 14176, product_name: "Magnesium Verla N Dragées", pzn: "03554928", price: 6.40, package_size: "50 st", description: "Magnesium for muscles and nerves", stock_level: 90, prescription_required: false, category: "Supplements" },
  { product_id: 704523, product_name: "Livocab direkt Augentropfen", pzn: "00676714", price: 14.99, package_size: "4 ml", description: "Fast-acting allergy eye drops", stock_level: 50, prescription_required: true, category: "Eye Care" },
  { product_id: 185422, product_name: "Cetirizin HEXAL Tropfen", pzn: "02579607", price: 13.19, package_size: "10 ml", description: "Antihistamine allergy drops", stock_level: 65, prescription_required: false, category: "Allergy" },
  { product_id: 198010, product_name: "Loperamid akut", pzn: "01338066", price: 3.93, package_size: "10 st", description: "Acute diarrhea treatment", stock_level: 110, prescription_required: false, category: "Digestive Health" },
  { product_id: 368367, product_name: "DulcoLax Dragées", pzn: "06800196", price: 22.90, package_size: "100 st", description: "Laxative for constipation relief", stock_level: 75, prescription_required: false, category: "Digestive Health" },
  { product_id: 717525, product_name: "Diclo-ratiopharm Schmerzgel", pzn: "04704198", price: 8.89, package_size: "50 g", description: "Pain gel for muscle and joint pain", stock_level: 95, prescription_required: false, category: "Pain Relief" },
  { product_id: 899231, product_name: "Vigantolvit 2000 I.E. Vitamin D3", pzn: "12423869", price: 17.99, package_size: "120 st", description: "Vitamin D for bones and immune support", stock_level: 80, prescription_required: false, category: "Supplements" },
  { product_id: 324024, product_name: "Vitasprint B12 Kapseln", pzn: "04909523", price: 17.04, package_size: "20 st", description: "Vitamin B12 for energy and nerves", stock_level: 55, prescription_required: false, category: "Supplements" },
  { product_id: 332568, product_name: "Sinupret Saft", pzn: "00605588", price: 13.30, package_size: "100 ml", description: "Herbal sinusitis treatment", stock_level: 48, prescription_required: false, category: "Respiratory" },
  { product_id: 368333, product_name: "Calmvalera Hevert Tropfen", pzn: "06560421", price: 35.97, package_size: "100 ml", description: "Homeopathic calming drops", stock_level: 33, prescription_required: false, category: "Mental Health" },
  { product_id: 879236, product_name: "Eucerin UreaRepair PLUS Lotion", pzn: "11678159", price: 27.75, package_size: "400 ml", description: "Intensive dry skin lotion", stock_level: 40, prescription_required: false, category: "Skin Care" },
  { product_id: 790661, product_name: "FeniHydrocort Creme 0.25%", pzn: "10796980", price: 8.59, package_size: "20 g", description: "Cortisone cream for skin inflammation", stock_level: 55, prescription_required: false, category: "Skin Care" },
];

export const categories = [...new Set(medicines.map(m => m.category))];
