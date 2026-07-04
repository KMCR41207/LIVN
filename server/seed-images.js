process.stdout.write('Starting image seed...\n');

const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const mongoose = require('mongoose');
const Product = require('./models/Product');

// CDN base for product images
const CDN = 'https://cdn.shopify.com/s/files/1/0949/9367/8706/files/';
const i = (f) => CDN + f;

// Image map: product name -> array of image URLs
const MAP = {
  'Blue Floral Stripe Lace Trim Cotton Kurta Set': [i('BLUEFLORALSTRIPE_DSC03136_b85a1aa2-6762-40f9-8e05-89625263dce6.jpg'),i('BLUEFLORALSTRIPE_DSC03123_5b435a8c-59eb-4476-9905-939b09f829b0.jpg'),i('BLUEFLORALSTRIPE_DSC03118_8e3aaed7-4580-4da1-b44d-537c8b11fe7b.jpg'),i('BLUEFLORALSTRIPE_DSC03120_2572596a-c6f6-454a-a25e-50c59e95eea0.jpg'),i('BLUEFLORALSTRIPE_DSC03126_187ec05c-212c-40bd-8d01-610544f1960d.jpg')],
  'Pink Floral Printed Cotton Kurta Set': [i('DSC06173.webp'),i('DSC06175.webp'),i('DSC06176.webp'),i('DSC06177.webp'),i('DSC06169_84dd6e7a-2c62-480e-95ea-c71fdc08d226.jpg')],
  'Rust Stripe Ajrakh Printed Cotton Kurta': [i('RUSTSTRIPEAJRAK_DSC04778_d02f77cf-11f4-46f9-bb63-6955b6135881.jpg'),i('RUSTSTRIPEAJRAK_DSC04768_fe5fc6b6-c7a0-46f4-bca0-dc2186f4536a.jpg'),i('RUSTSTRIPEAJRAK_DSC04771_a8f245ff-f421-4ccc-b958-f756a551bccd.jpg'),i('RUSTSTRIPEAJRAK_DSC04772_98b53411-db54-4c26-81b6-069fa6e7bc04.jpg'),i('RUSTSTRIPEAJRAK_DSC04773_bd7cba4f-dfdf-4bab-a9d0-e9236af4be6e.jpg')],
  'Green Ajrakh Embroidered Cotton Kurta': [i('BLACKAJRAK_DSC04496_081076c0-0c1e-40ec-89b3-f92c69ab9a30.jpg'),i('BLACKAJRAK_DSC04499_cd2928a0-8e48-4ada-98a2-afe8b612ce9f.jpg'),i('BLACKAJRAK_DSC04502_044bc963-2e91-4492-8aaa-a94655700d40.jpg'),i('BLACKAJRAK_DSC04504_e05bf7c5-9a90-47e1-804e-433f3cb4c1ae.jpg'),i('BLACKAJRAK_DSC04507_db47f1d8-5336-4886-937a-121e66ebb6d5.jpg')],
  'Green-Yellow Pintuck Detailing Cotton Kurta Set': [i('OMBRE_DSC03693_0ca061be-36aa-4eb8-926a-ee1d7cf1aee4.jpg'),i('OMBRE_DSC03683_45224913-80d4-40b1-ad42-ec9dc3013cd8.jpg'),i('OMBRE_DSC03681_20e31e9d-6232-46ab-9839-d5e2c8460e6f.jpg'),i('OMBRE_DSC03689_15d08610-a43f-4e27-8e5a-a0a325241567.jpg'),i('OMBRE_DSC03690_f75f06e3-bafc-4d4f-95e6-ead6ed137030.jpg')],
  'Blue Shibori Scallop Embroidered Cotton Kurta': [i('BLUESHIBSCALLOP_DSC03901_0e4b1f59-ad48-407f-a860-a1c487caa9b4.jpg'),i('BLUESHIBSCALLOP_DSC03903_a0a0fe15-ce50-4f40-b09c-ebf5d4cf1e6c.jpg'),i('BLUESHIBSCALLOP_DSC03906_57930bfa-3dc9-45d6-b378-e222fc62d582.jpg'),i('BLUESHIBSCALLOP_DSC03909_574712e5-1f18-430f-b9f8-0ea1979580e0.jpg'),i('BLUESHIBSCALLOP_DSC03912_2e43182f-7161-47b5-9e74-62ca128b30dc.jpg')],
  'Peach Pink Embroidered Ombre Cotton Kurta Set': [i('PEACHOMBREEMB_DSC02511_f4674908-7fca-445c-a5da-fe4f73c4fe42.jpg'),i('PEACHOMBREEMB_DSC02508_04c429d5-b72a-4dc3-8390-658a7cb08469.jpg'),i('PEACHOMBREEMB_DSC02513_1894ddfc-212f-495c-abd7-d8f9dadd2f34.jpg'),i('PEACHOMBREEMB_DSC02501_194aea44-d4a7-466a-a3d4-d74603da3aef.jpg'),i('PEACHOMBREEMB_DSC02515_3b8302ed-9dbf-47a0-8cd4-b2f22fb2de29.jpg')],
  'Asymmetrical Geometric Print Cotton Kurta': [i('RUSTPATCHAJRAK_DSC04586_f1a5293e-6610-4aac-a380-7526caf7356c.jpg'),i('RUSTPATCHAJRAK_DSC04588_213da8c3-057c-47ce-b432-3ec1da376344.jpg'),i('RUSTPATCHAJRAK_DSC04590_db2b66fe-7709-475b-a9b0-9b7d9f96d84f.jpg'),i('RUSTPATCHAJRAK_DSC04593_28aeebef-1458-4a38-bc0a-b3738fb8c483.jpg'),i('RUSTPATCHAJRAK_DSC04597_2d52cefa-6582-4258-bb62-6ed881ef1fba.jpg')],
  'Green Lotus Embroidered Cotton Kurta Set': [i('DSC05671.jpg'),i('DSC05673.jpg'),i('DSC05670.jpg'),i('DSC05672.jpg'),i('DSC05675.jpg')],
  'White Cotton Floral A-Line Kurta': [i('DSC06130_5a511cd4-9249-4428-819f-e0b5896313ee.jpg'),i('DSC06131_836c03d7-47a0-4dfb-81f0-926c8c19c2d0.jpg'),i('DSC06132_a0e1d6bf-a532-448b-931e-7e94ce0386ac.jpg'),i('DSC06133_f874895c-3a72-4be2-bc32-058ec4012719.jpg'),i('DSC06134_efe0256f-b864-4a62-8a95-8dd61b2a5f11.jpg')],
  'Vibrant Pink Botanical Printed Cotton Kurta Set': [i('PINKYELLOW_DSC02533_3d2672a5-e3c9-4053-bbaa-f6a459cae0ed.jpg'),i('PINKYELLOW_DSC02519_96039630-2ee9-43ef-876e-95d912b561d6.jpg'),i('PINKYELLOW_DSC02520_4c4b0660-92cf-4af6-b04b-58847ee20da4.jpg'),i('PINKYELLOW_DSC02522_7f03363b-8814-40b3-bcf4-2b5e79a1fc1d.jpg'),i('PINKYELLOW_DSC02530_edf468d7-e1c1-4d2b-90f3-d1490c9f5e44.jpg')],
  'Green Ajrakh Asymmetrical Cotton Kurta': [i('GREENAJRAK_DSC04531_8c293c6a-807b-4b97-a6fa-02c98b73da3b.jpg'),i('GREENAJRAK_DSC04532_44fd68de-89cb-44ee-bb04-d56723a8f9cd.jpg'),i('GREENAJRAK_DSC04567_29e6ec12-adbd-4e6e-97c9-5d37effd3a55.jpg'),i('GREENAJRAK_DSC04573_8b0a9475-ee1b-417b-b549-5374e7231cbe.jpg'),i('GREENAJRAK_DSC04574_f4dbf85e-24cf-404a-a2bf-c4e87a486277.jpg')],
  'Rust Stripe Ajrakh Printed Cotton Kurta Set & Dupatta': [i('RUSTSTRIPEAJRAK_DSC04754_62aa4614-f67e-4827-bce5-7984a9cb1dec.jpg'),i('RUSTSTRIPEAJRAK_DSC04756_23b8d23d-b755-4a61-bfac-f009ec0d6cfa.jpg'),i('RUSTSTRIPEAJRAK_DSC04760_4fdb5ec2-d833-4413-a77d-39244e00d87f.jpg'),i('RUSTSTRIPEAJRAK_DSC04763_4fb1d032-4166-4210-8c8c-3c5bd971d2ec.jpg'),i('RUSTSTRIPEAJRAK_DSC04765_37ce954c-3dd1-4776-baf1-0503f6fbfee8.jpg')],
  'Green Lotus Embroidered Cotton Kurta Set with Dupatta': [i('DSC05680.jpg'),i('DSC05689.jpg'),i('DSC05693.jpg'),i('DSC05687.jpg'),i('DSC05690.jpg')],
  'Green Ajrakh Asymmetrical Cotton Kurta Set': [i('GREENAJRAK_DSC04531_ed10975d-246c-446f-b906-029fe1e4a949.jpg'),i('GREENAJRAK_DSC04532_fb3de050-2830-41b8-ba4d-8fc3bc13af39.jpg'),i('GREENAJRAK_DSC04567_9b5abfe6-c023-4dcb-93cf-ae8a6f90a947.jpg'),i('GREENAJRAK_DSC04573_6f542023-aff1-4c5f-914d-4f0c6c51773e.jpg'),i('GREENAJRAK_DSC04578_96ca7598-c2f0-44f6-a7d1-4d180e120ffa.jpg')],
  'Black Kantha Embroidered Cotton Kurta Set': [i('BLACKKANTHA_DSC04111_0049b379-ee33-48b3-b9e4-95becee071ae.jpg'),i('BLACKKANTHA_DSC04095_d017ddba-5990-485d-965a-f053ec86e047.jpg'),i('BLACKKANTHA_DSC04097_a48533c9-4ddb-46d1-b9d8-63fc4c0c62db.jpg'),i('BLACKKANTHA_DSC04099_bd7aeeef-7648-4d58-a117-cd7365a0e1bf.jpg'),i('BLACKKANTHA_DSC04102_fa045859-8d26-46a5-8268-f64b24e1e36a.jpg')],
  'Blue Floral Stripe Lace Trim Cotton Kurta Set & Dupatta': [i('BLUEFLORALSTRIPE_DSC03104_083b552e-743c-413b-87ea-63bd90711578.jpg'),i('BLUEFLORALSTRIPE_DSC03105_44827f35-f73c-4240-864f-869cde97ae84.jpg'),i('BLUEFLORALSTRIPE_DSC03110_d343aa7a-9086-4178-b4d2-4fb77d242a69.jpg'),i('BLUEFLORALSTRIPE_DSC03114_944e9f0d-ccd4-49ba-9e5d-de62f1c9e471.jpg'),i('BLUEFLORALSTRIPE_DSC03123_2c8fbe6f-ad23-4bdf-aa58-df3aab425b54.jpg')],
  'Mustard Floral Stripe Lace Trim Cotton Kurta Set & Dupatta': [i('MUSTARDFLORALSTRIPE_DSC03186_9cb530ee-4e8d-4141-a676-608f80a457e4.jpg'),i('MUSTARDFLORALSTRIPE_DSC03189_4049332e-ddca-4f04-b2de-1e9e3466136c.jpg'),i('MUSTARDFLORALSTRIPE_DSC03167_3e7144a4-8f08-40ae-a38b-4bdaf46eec2d.jpg'),i('MUSTARDFLORALSTRIPE_DSC03174_df631bf7-53e7-4462-9350-08dd0df7ed35.jpg'),i('MUSTARDFLORALSTRIPE_DSC03177_d18bd28c-672e-4222-b516-3966c6e5cb61.jpg')],
  'Red Floral Pintuck Cotton Kurta Set with Dupatta': [i('DSC06237_80bee949-196d-4f36-8466-bcdb7834d4ff.jpg'),i('DSC06238_04571b86-4b59-4e2a-8379-b3cb5fe15437.jpg'),i('DSC06239_9c8805a6-708f-4873-a533-4713142b0dbb.jpg'),i('DSC06244_e8d29f16-fcdf-4ed0-867b-e5355b7343a2.jpg'),i('DSC06245_0c716564-8e63-4b47-afe2-a00947965ed2.jpg')],
  'Peach Floral Check Embroidered Cotton Kurta Set with Dupatta': [i('DSC05978.jpg'),i('DSC05986.jpg'),i('DSC05976.jpg'),i('DSC05980.jpg'),i('DSC05984.jpg')],
  'Yellow Rayon A-Line Coord Set': [i('DSC00868.jpg'),i('DSC00869.jpg'),i('DSC00872.jpg'),i('DSC00881.jpg'),i('DSC00892.jpg')],
  'Blue Cotton A-Line Kurta Set with Dupatta': [i('DSC05642.jpg'),i('DSC05625.jpg'),i('DSC05628.jpg'),i('DSC05632.jpg'),i('DSC05638.jpg')],
  'Yellow Palm Lace Detail Cotton Kurta Set & Dupatta': [i('DSC05855.jpg'),i('DSC05841.jpg'),i('DSC05842.jpg'),i('DSC05844.jpg'),i('DSC05847.jpg')],
  'Blue Shibori Scallop Embroidered Cotton Kurta Set': [i('BLUESHIBSCALLOP_DSC03915_edb7332c-5c87-4ca2-8a6f-df3dac63e972.jpg'),i('BLUESHIBSCALLOP_DSC03901_3585a128-a9a9-4a01-b96d-b69ba077fcd5.jpg'),i('BLUESHIBSCALLOP_DSC03903_ddc94215-8367-4074-9170-40f93b237fe1.jpg'),i('BLUESHIBSCALLOP_DSC03906_12bd1206-59b1-49a9-a040-f6283fb806a3.jpg'),i('BLUESHIBSCALLOP_DSC03912_df9b7154-f26b-45e4-b31f-9a4e2588e108.jpg')],
};

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 15000 })
  .then(async () => {
    process.stdout.write('Connected to: ' + mongoose.connection.db.databaseName + '\n');
    let updated = 0;
    for (const [name, images] of Object.entries(MAP)) {
      const r = await Product.updateOne({ name }, { $set: { images, image: images[0] } });
      process.stdout.write((r.matchedCount > 0 ? 'Updated: ' : 'Not found: ') + name + '\n');
      if (r.matchedCount > 0) updated++;
    }
    process.stdout.write('\nDone. ' + updated + '/' + Object.keys(MAP).length + ' products updated.\n');
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(e => {
    process.stderr.write('Connection error: ' + e.message + '\n');
    process.exit(1);
  });
