import { db } from "./connection.js";
import { migrate } from "./migrate.js";
import { seed } from "./seed.js";

migrate();
db.exec("DELETE FROM order_items; DELETE FROM orders;");
seed();
console.log("EMBER demo database reset");
