// Define the menu items
export const mainMenu = [
  { name: "home", href: "/" },
  { name: "shop", href: "/shop" },
  { name: "blog", href: "/posts" },
  { name: "about", href: "https://rakeshretails.in/about-us/", isExternal: true },
];


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
    name: "Air Conditioners",
    slug: "air-conditioners",
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
          { name: "O'General", slug: "o-general-window-ac" },
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
    ],
  },
  {
    name: "TV & Audio",
    slug: "tv-entertainment",
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
        ],
      },
      {
        title: "Brand",
        links: [
          { name: "Samsung", slug: "samsung-tv" },
          { name: "Lloyd", slug: "lloyd-tv" },
          { name: "Haier", slug: "haier-tv" },
          { name: "Hisense", slug: "hisense-tv" },
          { name: "LG", slug: "lg-tv" },
          { name: "DH Discovery", slug: "dh-discovery-audio" },
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
          { name: "Microwave", slug: "microwaves" },
          { name: "Oven Toaster Griller", slug: "otg" },
          { name: "Induction", slug: "induction-cooktops" },
          { name: "Gas Stove", slug: "gas-stoves" },
          { name: "Food Processor", slug: "food-processors" },
          { name: "Dish Washer", slug: "dishwashers" },
        ],
      },
      {
        title: "Small Appliances",
        links: [
          { name: "Mixer Grinder", slug: "mixer-grinders" },
          { name: "Coffee Maker", slug: "coffee-makers" },
          { name: "Air Fryer", slug: "air-fryers" },
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
        ],
      },
    ],
  },
  {
    name: "Home Essentials",
    slug: "home-appliances",
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
          { name: "Iron", slug: "dry-steam-irons" },
          { name: "Water Dispenser", slug: "water-dispensers" },
          { name: "Water Purifier", slug: "lg-water-purifiers" },
          { name: "Air Purifier", slug: "havells-air-purifiers" },
        ],
      },
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
        ],
      },
      {
        title: "Air Coolers",
        links: [
          { name: "Symphony", slug: "symphony-cooler" },
          { name: "Godrej", slug: "godrej-cooler" },
          { name: "Usha", slug: "usha-cooler" },
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
    name: "Mobiles & Accessories",
    slug: "mobiles",
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
