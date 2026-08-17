export const FEATURES = [
  {
    title: "AI зөвлөгөө",
    body: "Хиймэл оюун ухааны тусламжтайгаар өөрийн арьс, үсний онцлогт тохирсон үйлчилгээг санал болгоно.",
    /** 2×2 sprite of 3D icons exported from Figma; each cell is 64×64. */
    sprite: "0 0",
  },
  {
    title: "Баталгаажсан мэргэжилтнүүд",
    body: "Зөвхөн мэргэжлийн үнэмлэхтэй, туршлагатай, үнэлгээ өндөр салон болон артистуудтай хамтарна.",
    sprite: "-64px 0",
  },
  {
    title: "Хялбар захиалга",
    body: "Хэдхэн товшилтоор өөрийн боломжтой цагтаа, хүссэн үйлчилгээгээ захиалах боломжтой.",
    sprite: "0 -64px",
  },
  {
    title: "Найдвартай төлбөр",
    body: "Бүх төрлийн банкны карт болон апп ашиглан аюулгүй, хурдан төлбөр тооцоо хийх системтэй.",
    sprite: "-64px -64px",
  },
];

export const STEPS = [
  {
    n: 1,
    title: "Хайх",
    body: "Өөрт ойр байрлах салон эсвэл хүссэн үйлчилгээгээ хайж олох.",
  },
  {
    n: 2,
    title: "AI зөвлөгөө авах",
    body: "AI системээр дамжуулан өөрийн онцлогт тохирсон үйлчилгээг сонгох.",
  },
  {
    n: 3,
    title: "Захиалах",
    body: "Боломжтой цагийг сонгон баталгаажуулж, үйлчилгээгээ авах.",
  },
];

export const CATEGORIES = [
  { label: "Үсчин", img: "/img/cat-hair.jpg" },
  { label: "Маникюр", img: "/img/cat-nails.jpg" },
  { label: "Шивээс", img: "/img/cat-tattoo.jpg" },
  { label: "Сормуус", img: "/img/cat-lashes.jpg" },
  { label: "Хөмсөг", img: "/img/cat-brows.jpg" },
  { label: "Спа", img: "/img/cat-spa.jpg" },
  { label: "Массаж", img: "/img/cat-massage.jpg" },
  { label: "Нүүр будалт", img: "/img/cat-makeup.jpg" },
];

export const PROVIDERS = [
  {
    name: "Nandin Beauty Lounge",
    tags: "Үсчин, Гоо сайхан",
    rating: "4.9",
    price: "₮45,000",
    cover: "/img/provider-1-cover.jpg",
    avatar: "/img/provider-1-avatar.jpg",
  },
  {
    name: "Boldoo Nails & Art",
    tags: "Маникюр, Педикюр",
    rating: "4.8",
    price: "₮30,000",
    cover: "/img/provider-2-cover.jpg",
    avatar: "/img/provider-2-avatar.jpg",
  },
  {
    name: "Oasis Wellness Spa",
    tags: "Spa, Бариа засал",
    rating: "5.0",
    price: "₮80,000",
    cover: "/img/provider-3-cover.jpg",
    avatar: "/img/provider-3-avatar.jpg",
  },
];
