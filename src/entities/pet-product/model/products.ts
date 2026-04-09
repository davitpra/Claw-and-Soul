export interface Product {
  name: string;
  desc: string;
  price: string;
  img: string;
  badge?: string;
  tag?: string;
  hasPlay?: boolean;
  // Shopify/backend integration — populated when synced via Phase 2/3
  shopifyHandle?: string;
  productRefId?: string;
}

export const productsList: Product[] = [
  {
    name: "Jigsaw Puzzle",
    desc: "Family fun time",
    price: "$45.00",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    badge: "1000 pcs",
    // TODO: set shopifyHandle and productRefId once synced from backend
  },
  {
    name: "Framed Painting",
    desc: "Gallery quality wood",
    price: "$89.99",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    // TODO: set shopifyHandle and productRefId once synced from backend
  },
  {
    name: "Coloring Book",
    desc: "Relax with art therapy",
    price: "$29.99",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    tag: "Coloring Edition",
    // TODO: set shopifyHandle and productRefId once synced from backend
  },
  {
    name: "Animated Notebook",
    desc: "Scannable AR cover",
    price: "$34.50",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    hasPlay: true,
    // TODO: set shopifyHandle and productRefId once synced from backend
  },
];
