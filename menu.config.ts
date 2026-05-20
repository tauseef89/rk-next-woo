// Define the menu items
export const mainMenu = {
  home: "/",
  shop: "/shop",
  blog: "/posts",
  about: "/about",
};

export const categoryMenu = {
  "Air Conditioners": "/shop/category/air-conditioners",
  "Mobiles": "/shop/category/mobiles",
  "Tablets & Accessories": "/shop/category/tablets",
  "Laptops & Accessories": "/shop/category/laptops",
  "Home Appliances": "/shop/category/home-appliances",
  "Kitchen Appliances": "/shop/category/kitchen-appliances",
  "TV & Entertainment": "/shop/category/television",
  "Personal Care": "/shop/category/personal-care",
  "Headphones & Speakers": "/shop/category/audio",
};
export const MEGA_MENU_CONFIG = [
  {
    name: "Cooling",
    slug: "cooling",
    image: "/images/mega-menu/Ac-Menu-Banner.png",
    columns: [
      {
        title: "Split Air Conditioners",
        links: [
          { name: "1 Ton", slug: "split-ac-1-ton" },
          { name: "1.5 Ton", slug: "split-ac-1-5-ton" },
          { name: "2 Ton", slug: "split-ac-2-ton" },
          { name: "LG", slug: "lg-split-ac" },
          { name: "Voltas", slug: "voltas-split-ac" },
          { name: "Godrej", slug: "godrej-split-ac" },
          { name: "Daikin", slug: "daikin-split-ac" },
          { name: "Blue Star", slug: "blue-star-split-ac" },
          { name: "Lloyd", slug: "lloyd-split-ac" },
        ],
      },
      {
        title: "Window Air Conditioners",
        links: [
          { name: "1 Ton", slug: "window-ac-1-ton" },
          { name: "1.5 Ton", slug: "window-ac-1-5-ton" },
          { name: "2 Ton", slug: "window-ac-2-ton" },
          { name: "LG", slug: "lg-window-ac" },
          { name: "Voltas", slug: "voltas-window-ac" },
          { name: "Godrej", slug: "godrej-window-ac" },
          { name: "O'General", slug: "ogeneral-window-ac" },
        ],
      },
      {
        title: "Air Coolers",
        links: [
          { name: "Symphony", slug: "symphony-coolers" },
          { name: "Crompton", slug: "crompton-coolers" },
        ],
      },
      {
        title: "Commercial ACs",
        links: [
          { name: "Cassette", slug: "cassette-ac" },
          { name: "Ductable", slug: "ductable-ac" },
          { name: "Tower", slug: "tower-ac" },
        ],
      },
      {
        title: "Deep Freezers",
        links: [
          { name: "Haier", slug: "haier-deep-freezers" },
          { name: "Blue Star", slug: "blue-star-deep-freezers" },
          { name: "Godrej", slug: "godrej-deep-freezers" },
        ],
      },
    ],
  },
  {
    name: "TV & Audio",
    slug: "tv-audio",
    image: "/images/mega-menu/TV-Menu-Banner.png",
    columns: [
      {
        title: "Television",
        links: [
          { name: "OLED", slug: "oled-tvs" },
          { name: "QLED", slug: "qled-tvs" },
          { name: "Smart TV", slug: "smart-tvs" },
          { name: "LED", slug: "led-tvs" },
        ],
      },
      {
        title: "Audio",
        links: [
          { name: "Headphones", slug: "headphones" },
          { name: "Earbuds", slug: "earbuds" },
          { name: "Soundbar", slug: "soundbars" },
          { name: "Speakers", slug: "speakers" },
          { name: "Home Theatre", slug: "home-theatre" },
          { name: "Karaoke", slug: "karaoke" },
        ],
      },
      {
        title: "Brand",
        links: [
          { name: "Samsung", slug: "samsung-tv" },
          { name: "Hisense", slug: "hisense-tv" },
          { name: "LG", slug: "lg-tv" },
          { name: "JBL", slug: "jbl-audio" },
        ],
      },
    ],
  },
  {
    name: "Large Appliances",
    slug: "large-appliances",
    image: "/images/mega-menu/Larg-Apl-Menu-Banner.png",
    columns: [
      {
        title: "Refrigerators",
        links: [
          { name: "Direct Cool", slug: "direct-cool-refrigerators" },
          { name: "Frost Free", slug: "frost-free-refrigerators" },
          { name: "Side-by-Side", slug: "side-by-side-refrigerators" },
        ],
      },
      {
        title: "Washing Machines",
        links: [
          { name: "Front Load", slug: "front-load-washers" },
          { name: "Top Load", slug: "top-load-washers" },
          { name: "Semi Automatic", slug: "semi-automatic-washers" },
          { name: "Dryer", slug: "dryers" },
        ],
      },
      {
        title: "Brand",
        links: [
          { name: "LG", slug: "lg-appliances" },
          { name: "Godrej", slug: "godrej-appliances" },
          { name: "Haier", slug: "haier-appliances" },
          { name: "Whirlpool", slug: "whirlpool-appliances" },
          { name: "IFB", slug: "ifb-appliances" },
        ],
      },
    ],
  },
  {
    name: "Kitchen Appliances",
    slug: "kitchen-appliances",
    image: "/images/mega-menu/Kit-App-Menu-Banner.png",
    columns: [
      {
        title: "Cooking",
        links: [
          { name: "LG Microwave", slug: "lg-microwaves" },
          { name: "Oven Toaster Griller", slug: "otg" },
          { name: "Induction", slug: "induction-cooktops" },
          { name: "Gas Stove", slug: "gas-stoves" },
        ],
      },
      {
        title: "Small Appliances",
        links: [
          { name: "Mixer Grinder", slug: "mixer-grinders" },
          { name: "Coffee Maker", slug: "coffee-makers" },
          { name: "Philips Air Fryer", slug: "air-fryers" },
          { name: "Chimney", slug: "chimneys" },
          { name: "Sandwich Maker", slug: "sandwich-makers" },
          { name: "Kettle", slug: "kettles" },
        ],
      },
      {
        title: "Brand",
        links: [
          { name: "Philips", slug: "philips-kitchen" },
          { name: "Lloyd", slug: "lloyd-kitchen" },
          { name: "LG", slug: "lg-kitchen" },
          { name: "Food Processor", slug: "food-processors" },
          { name: "Dish Washer", slug: "dishwashers" },
        ],
      },
    ],
  },
  {
    name: "Home Essentials",
    slug: "home-essentials",
    image: "/images/mega-menu/Home-utti-Menu-Banner.png",
    columns: [
      {
        title: "Small Home Appliances",
        links: [
          { name: "Havells Geyser", slug: "havells-geysers" },
          { name: "Usha Geyser", slug: "usha-geysers" },
          { name: "Oil Heater", slug: "oil-heaters" },
          { name: "Stabliser", slug: "stabilizers" },
          { name: "Vaccum Cleaner", slug: "vacuum-cleaners" },
          { name: "Massager", slug: "massagers" },
          { name: "Water Dispenser", slug: "water-dispensers" },
        ],
      },
      {
        title: "Utility",
        links: [
          { name: "Iron", slug: "dry-steam-irons" },
          { name: "Hair Dryer", slug: "hair-dryers" },
          { name: "Inverter", slug: "inverters" },
          { name: "Hair Curler", slug: "hair-curlers" },
          { name: "TRIMMER", slug: "trimmers" },
          { name: "Straightner", slug: "hair-straighteners" },
        ],
      },
      {
        title: "Water Purifier",
        links: [
          { name: "LG Water purifier", slug: "lg-water-purifiers" },
        ],
      },
      {
        title: "Air Purifier",
        links: [
          { name: "Havells Air Purifier", slug: "havells-air-purifiers" },
        ],
      },
      
    ],
  },
  {
    name: "Mobiles & Accessories",
    slug: "mobiles-accessories",
    image: "/images/mega-menu/Mobile-Menu-Banner.png",
    columns: [
      {
        title: "Smartphones",
        links: [
          { name: "Apple", slug: "iphones" },
          { name: "Samsung", slug: "samsung-mobiles" },
          { name: "Redmi", slug: "redmi-mobiles" },
          { name: "Realme", slug: "realme-mobiles" },
          { name: "Vivo", slug: "vivo-mobiles" },
        ],
      },
      {
        title: "Accessories",
        links: [
          { name: "Smartwatch", slug: "smartwatches" },
          { name: "Power Bank", slug: "power-banks" },
          { name: "Chargers", slug: "mobile-chargers" },
          { name: "Landline", slug: "landline-phones" },
          { name: "Play Station", slug: "gaming-consoles" },
        ],
      },
      {
        title: "Brand",
        links: [
          { name: "Apple", slug: "apple-brand" },
          { name: "Samsung", slug: "samsung-brand" },
          { name: "Redmi", slug: "redmi-brand" },
          { name: "Realme", slug: "realme-brand" },
          { name: "Vivo", slug: "vivo-brand" },
        ],
      },
    ],
  },
  {
    name: "Furniture",
    slug: "furniture",
    image: "/images/mega-menu/Furni-Menu-Banner.png",
    columns: [
      {
        title: "Living",
        links: [
          { name: "Beds", slug: "beds" },
          { name: "Mattresses", slug: "mattresses" },
        ],
      },
      {
        title: "Storage",
        links: [
          { name: "Almirahs", slug: "almirahs" },
          { name: "Wardrobes", slug: "wardrobes" },
          { name: "Trolly", slug: "luggage-trolleys" },
        ],
      },
      {
        title: "Security",
        links: [
          { name: "Godrej Lockers", slug: "godrej-safes" },
          { name: "Home Lockers", slug: "digital-safes" },
        ],
      },
    ],
  },
];


export const contentMenu = {
  categories: "/posts/categories",
  tags: "/posts/tags",
  authors: "/posts/authors",
};

export const shopMenu = {
  products: "/shop",
  cart: "/cart",
  account: "/account",
};

export const policyMenu = [
  {
    name: "Terms & Conditions",
    slug: "terms",
  },
  {
    name: "Privacy policy",
    slug: "privacy",
  },
  {
    name: "Cancellation Policy",
    slug: "cancellation",
  },
  {
    name: "Shipping Policy",
    slug: "policy",
  }];
