export type DirectorioPlan = {
  slug: "inicial" | "pro" | "completo";
  name: string;
  records: string;
  price: number;
};

export const directorioPlans: DirectorioPlan[] = [
  {
    slug: "inicial",
    name: "Pack Inicial",
    records: "5.000",
    price: 19900,
  },
  {
    slug: "pro",
    name: "Pack PRO",
    records: "12.000",
    price: 34900,
  },
  {
    slug: "completo",
    name: "Pack Completo",
    records: "21.151",
    price: 49900,
  },
];

export function getDirectorioPlanByName(name: string) {
  return directorioPlans.find((plan) => plan.name === name);
}
