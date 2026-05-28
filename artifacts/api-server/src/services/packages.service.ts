import { db } from "@workspace/db";
import { packagesTable, type InsertPackage } from "@workspace/db/schema";

const DEFAULT_PACKAGES: InsertPackage[] = [
  { id: "o1", operator: "Orange", name: "1 Go", dataLabel: "1 Go", priceFcfa: 1000, validity: "24 heures" },
  { id: "o2", operator: "Orange", name: "5 Go", dataLabel: "5 Go", priceFcfa: 5000, validity: "7 jours" },
  { id: "o3", operator: "Orange", name: "20 Go", dataLabel: "20 Go", priceFcfa: 15000, validity: "30 jours" },
  { id: "o4", operator: "Orange", name: "50 Go", dataLabel: "50 Go", priceFcfa: 25000, validity: "30 jours" },
  { id: "m1", operator: "MTN", name: "1 Go", dataLabel: "1 Go", priceFcfa: 900, validity: "24 heures" },
  { id: "m2", operator: "MTN", name: "5 Go", dataLabel: "5 Go", priceFcfa: 4500, validity: "7 jours" },
  { id: "m3", operator: "MTN", name: "20 Go", dataLabel: "20 Go", priceFcfa: 14000, validity: "30 jours" },
  { id: "m4", operator: "MTN", name: "50 Go", dataLabel: "50 Go", priceFcfa: 24000, validity: "30 jours" },
  { id: "mv1", operator: "Moov", name: "1 Go", dataLabel: "1 Go", priceFcfa: 800, validity: "24 heures" },
  { id: "mv2", operator: "Moov", name: "5 Go", dataLabel: "5 Go", priceFcfa: 4000, validity: "7 jours" },
  { id: "mv3", operator: "Moov", name: "20 Go", dataLabel: "20 Go", priceFcfa: 13000, validity: "30 jours" },
  { id: "mv4", operator: "Moov", name: "50 Go", dataLabel: "50 Go", priceFcfa: 22000, validity: "30 jours" },
];

export async function seedPackages(): Promise<void> {
  for (const pkg of DEFAULT_PACKAGES) {
    await db
      .insert(packagesTable)
      .values(pkg)
      .onConflictDoNothing({ target: packagesTable.id });
  }
}

export async function listActivePackages() {
  return db.query.packagesTable.findMany({
    where: (packages, { eq }) => eq(packages.isActive, true),
    orderBy: (packages, { asc }) => [asc(packages.operator), asc(packages.priceFcfa)],
  });
}
