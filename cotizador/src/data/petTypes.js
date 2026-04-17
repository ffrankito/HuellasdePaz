import { Dog, Cat, PawPrint, Rabbit, Rat, Bird } from "lucide-react";

export const petTypes = [
  { id: "canino", title: "Canino", desc: "Cualquier raza de perros.", group: "principal", icon: Dog },
  { id: "felino", title: "Felino", desc: "Cualquier raza de gatos.", group: "principal", icon: Cat },
  { id: "otro", title: "Otro", desc: "Otras mascotas domésticas.", group: "principal", icon: PawPrint },
  { id: "mamifero-pequeno", title: "Mamífero pequeño", desc: "Hamsters, cobayos, conejos, etc.", group: "otros", icon: Rabbit },
  { id: "mamifero-grande", title: "Mamífero grande", desc: "Cerdos y otros mamíferos.", group: "otros", icon: Rat },
  { id: "reptil", title: "Reptil", desc: "Iguanas, tortugas, serpientes.", group: "otros", icon: PawPrint },
  { id: "ave-pez", title: "Ave o pez", desc: "Loros, canarios, cacatúas, etc.", group: "otros", icon: Bird },
];