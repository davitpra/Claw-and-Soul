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
    name: "Framed Canvas",
    desc: "Gallery quality wood",
    price: "$89.99",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    shopifyHandle: "framed-canvas",
    productRefId: "9b3a1ca9-5969-4206-a50a-ec63786f5e1d",
  },
  {
    name: "Framed Poster",
    desc: "Premium print, wooden frame",
    price: "$69.99",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    shopifyHandle: "framed-poster",
    productRefId: "0c824c23-8bdb-45b8-9164-c104b0236821",
  },
  {
    name: "Museum Quality Poster",
    desc: "Matte paper, wooden frame",
    price: "$99.99",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    badge: "Museum Grade",
    shopifyHandle: "museum-quality-matte-paper-wooden-framed-poster",
    productRefId: "152ed4f4-82c7-4302-b2b9-725da897fb39",
  },
  {
    name: "Photo Paper Poster",
    desc: "Vibrant colors, photo finish",
    price: "$34.50",
    img: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqruKWQZ48vypKc2KDwNU-A7eEWdee-4qr7voxSvahEirYjZJ3QmSQMZSa4GHMtmnjI5eTkQfmrY_hd3Sp46B3xITbeVqTwp4XU1EloL1v5pcuDA9l4RURurJdjzNpvBGAgPEgHl3KN1meLDAZgCl8cz3N49OEkrBHw17RvTAg9yq42QveTPszKqVLTB4gpTuwYnGVVDvh1_ky8ntzJ1OfwAYwrovrGYI0CPR268a3bUtfLR0K6QW4WMTsFYnGXXL-L6NlHeSXeR44",
    shopifyHandle: "photo-paper-poster",
    productRefId: "4a67c67c-4431-4254-a748-813790631161",
  },
];
