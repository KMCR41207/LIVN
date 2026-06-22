const PRODUCTS = [
  {
    id: 1,
    name: "Floral Sleeveless Kurti",
    category: "Sleeveless Kurti",
    price: 2499,
    image: "/static/assets/images/category_sleeveless_kurti.jpeg",
    description: "A breezy, floral sleeveless kurti crafted for effortless everyday elegance. Light fabric, clean silhouette, and a fit that flatters every frame.",
    details: ["Pure Cotton Fabric", "Floral block print", "Regular fit", "Machine washable"]
  },
  {
    id: 2,
    name: "Embroidered Full Sleeve Kurti",
    category: "Full Sleeve Kurti",
    price: 3199,
    image: "/static/assets/images/category_full_sleeve_kurti.jpeg",
    description: "A richly embroidered full sleeve kurti that blends tradition with modern tailoring. Perfect for festive occasions and everyday grace.",
    details: ["Chanderi Silk Blend", "Thread embroidery", "Straight cut", "Dry clean recommended"]
  },
  {
    id: 3,
    name: "Structured Corset Kurti",
    category: "Corset Kurti",
    price: 3799,
    image: "/static/assets/images/category_corset_kurti.jpeg",
    description: "A bold, structured corset kurti with a defined waist and contemporary silhouette. Designed for the woman who owns every room she walks into.",
    details: ["Premium Cotton Blend", "Boning detail", "Fitted silhouette", "Custom fit available"]
  },
  {
    id: 4,
    name: "Printed Noodle Strap Kurti",
    category: "Noodle Strap Kurti",
    price: 1999,
    image: "/static/assets/images/category_noodle_strap_kurti.jpeg",
    description: "A delicate noodle strap kurti with a relaxed, feminine drape. Light, airy, and effortlessly stylish for warm days and casual evenings.",
    details: ["Rayon Fabric", "Printed pattern", "Relaxed fit", "Machine washable"]
  },
  {
    id: 5,
    name: "Classic Halter Neck Kurti",
    category: "Halter Neck Kurti",
    price: 2799,
    image: "/static/assets/images/category_halter_neck_kurti.jpeg",
    description: "A sleek halter neck kurti with clean lines and a confident silhouette. Minimal, modern, and made to turn heads.",
    details: ["Georgette Fabric", "Halter neckline", "A-line cut", "Hand wash recommended"]
  }
];

const CATEGORIES = [
  { name: "Sleeveless Kurti",   image: "/static/assets/images/category_sleeveless_kurti.jpeg",   slug: "sleeveless-kurti" },
  { name: "Full Sleeve Kurti",  image: "/static/assets/images/category_full_sleeve_kurti.jpeg",  slug: "full-sleeve-kurti" },
  { name: "Corset Kurti",       image: "/static/assets/images/category_corset_kurti.jpeg",       slug: "corset-kurti" },
  { name: "Noodle Strap Kurti", image: "/static/assets/images/category_noodle_strap_kurti.jpeg", slug: "noodle-strap-kurti" },
  { name: "Halter Neck Kurti",  image: "/static/assets/images/category_halter_neck_kurti.jpeg",  slug: "halter-neck-kurti" }
];

function getProductById(id) {
  return PRODUCTS.find(p => p.id === parseInt(id));
}

function getProductsByCategory(category) {
  return PRODUCTS.filter(p => p.category.toLowerCase().replace(/\s+/g, '-') === category);
}

function formatPrice(price) {
  return '₹' + price.toLocaleString('en-IN');
}
