import { useState } from "react";
import { Package } from "lucide-react";
import { CatalogueItem } from "../lib/schemas";
import { useSession } from "../store/useSession";
import { useCopy } from "../i18n";
import sampleImage from "../data/demo/product_papad.jpg";
function Item({ item, index }: { item: CatalogueItem; index: number }) {
  const l = useCopy(),
    { report, save } = useSession(),
    [editing, edit] = useState(false),
    [next, set] = useState(item),
    [invalid, error] = useState(false);
  if (!report) return null;
  return (
    <article className="panel">
      {report.demo ? (
        <img
          className="product-img"
          src={sampleImage}
          alt={l("Fictional product sheet", "काल्पनिक उत्पाद चित्र")}
        />
      ) : (
        <Package />
      )}
      {editing ? (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const result = CatalogueItem.safeParse(next);
            if (!result.success) {
              error(true);
              return;
            }
            save({
              ...report,
              catalogue: report.catalogue.map((v, i) =>
                index === i ? result.data : v,
              ),
            });
            edit(false);
          }}
        >
          {(["name", "nameHi", "description", "category", "unit"] as const).map(
            (key, i) => (
              <label key={key}>
                {l(
                  [
                    "English name",
                    "Hindi name",
                    "Description",
                    "Category",
                    "Unit",
                  ][i],
                  ["अंग्रेज़ी नाम", "हिन्दी नाम", "विवरण", "श्रेणी", "इकाई"][i],
                )}
                <input
                  maxLength={1200}
                  required={key !== "unit"}
                  value={next[key] ?? ""}
                  onChange={(e) =>
                    set({
                      ...next,
                      [key]: e.target.value || (key === "unit" ? null : ""),
                    })
                  }
                />
              </label>
            ),
          )}
          <label>
            {l("Price (₹)", "मूल्य (₹)")}
            <input
              type="number"
              min="0"
              step="0.01"
              value={next.suggestedPriceINR ?? ""}
              onChange={(e) =>
                set({
                  ...next,
                  suggestedPriceINR:
                    e.target.value === "" ? null : Number(e.target.value),
                })
              }
            />
          </label>
          {invalid && (
            <p role="alert">
              {l("Check the required fields.", "ज़रूरी फ़ील्ड जाँचें।")}
            </p>
          )}
          <button className="btn primary">{l("Save", "सहेजें")}</button>{" "}
          <button
            className="btn secondary"
            type="button"
            onClick={() => edit(false)}
          >
            {l("Cancel", "रद्द करें")}
          </button>
        </form>
      ) : (
        <>
          <small>{item.category}</small>
          <h2>{item.nameHi}</h2>
          <b>{item.name}</b>
          <p>{item.description}</p>
          <p>
            {item.suggestedPriceINR === null
              ? l("Price not visible", "मूल्य उपलब्ध नहीं")
              : `₹${item.suggestedPriceINR}`}{" "}
            · {item.unit ?? "—"}
          </p>
          <button
            className="btn secondary"
            onClick={() => {
              set(item);
              error(false);
              edit(true);
            }}
          >
            {l("Edit item", "उत्पाद बदलें")}
          </button>
        </>
      )}
    </article>
  );
}
export function CatalogueGrid({ items }: { items: CatalogueItem[] }) {
  const l = useCopy();
  return items.length ? (
    <div className="cards">
      {items.map((item, i) => (
        <Item key={i} item={item} index={i} />
      ))}
    </div>
  ) : (
    <p className="panel">
      {l(
        "No identifiable products. Add a clear product photo on a new run.",
        "उत्पाद नहीं मिला। अगली बार स्पष्ट फ़ोटो जोड़ें।",
      )}
    </p>
  );
}
