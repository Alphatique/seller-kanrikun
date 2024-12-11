type StockingData = {
	item_id: string;
	item_name: string;
	category: string;
	subCategory: string;
	asin: string;
	salesCountPast90Days: number;
	salesCountPast30Days: number;
	stockCount: number;
};

export default [
	{
		item_id: '12345',
		item_name: 'Wireless Mouse',
		category: 'Electronics',
		subCategory: 'Computer Accessories',
		asin: 'B09XYZ1234',
		salesCountPast90Days: 150,
		salesCountPast30Days: 50,
		stockCount: 200,
	},
	{
		item_id: '12346',
		item_name: 'Bluetooth Speaker',
		category: 'Electronics',
		subCategory: 'Audio',
		asin: 'B09XYZ1235',
		salesCountPast90Days: 300,
		salesCountPast30Days: 120,
		stockCount: 100,
	},
	{
		item_id: '12347',
		item_name: 'Running Shoes',
		category: 'Sportswear',
		subCategory: 'Footwear',
		asin: 'B09XYZ1236',
		salesCountPast90Days: 250,
		salesCountPast30Days: 90,
		stockCount: 150,
	},
	{
		item_id: '12348',
		item_name: 'Yoga Mat',
		category: 'Sportswear',
		subCategory: 'Fitness',
		asin: 'B09XYZ1237',
		salesCountPast90Days: 400,
		salesCountPast30Days: 150,
		stockCount: 50,
	},
	{
		item_id: '12349',
		item_name: 'Water Bottle',
		category: 'Kitchen',
		subCategory: 'Hydration',
		asin: 'B09XYZ1238',
		salesCountPast90Days: 500,
		salesCountPast30Days: 200,
		stockCount: 300,
	},
	{
		item_id: '12350',
		item_name: 'Smartphone Case',
		category: 'Electronics',
		subCategory: 'Accessories',
		asin: 'B09XYZ1239',
		salesCountPast90Days: 600,
		salesCountPast30Days: 250,
		stockCount: 400,
	},
	{
		item_id: '12351',
		item_name: 'Notebook',
		category: 'Stationery',
		subCategory: 'Office Supplies',
		asin: 'B09XYZ1240',
		salesCountPast90Days: 700,
		salesCountPast30Days: 300,
		stockCount: 500,
	},
	{
		item_id: '12352',
		item_name: 'Ballpoint Pen',
		category: 'Stationery',
		subCategory: 'Writing Instruments',
		asin: 'B09XYZ1241',
		salesCountPast90Days: 800,
		salesCountPast30Days: 350,
		stockCount: 600,
	},
	{
		item_id: '12353',
		item_name: 'Desk Lamp',
		category: 'Home',
		subCategory: 'Lighting',
		asin: 'B09XYZ1242',
		salesCountPast90Days: 250,
		salesCountPast30Days: 100,
		stockCount: 150,
	},
	{
		item_id: '12354',
		item_name: 'USB Cable',
		category: 'Electronics',
		subCategory: 'Cables',
		asin: 'B09XYZ1243',
		salesCountPast90Days: 450,
		salesCountPast30Days: 180,
		stockCount: 220,
	},
] as StockingData[];
