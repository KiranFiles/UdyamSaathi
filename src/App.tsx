import { Link, Route, Routes } from "react-router-dom";
import { BarChart3, Sprout } from "lucide-react";
import { useTranslation } from "react-i18next";
import { LanguageToggle } from "./components/LanguageToggle";
import Home from "./pages/Home";
import Capture from "./pages/Capture";
import Processing from "./pages/Processing";
import Results from "./pages/Results";
import { lazy, Suspense } from "react";
const DistrictDashboard = lazy(() => import("./pages/DistrictDashboard"));
export default function App() {
  const { t } = useTranslation();
  return (
    <>
      <header>
        <nav>
          <Link to="/" className="brand">
            <span className="mark">
              <Sprout />
            </span>
            <span>
              {t("brand")}
              <small>{t("tag")}</small>
            </span>
          </Link>
          <div className="nav-actions">
            <Link to="/dashboard" aria-label={t("district")}>
              <BarChart3 size={19} />
              <span>{t("district")}</span>
            </Link>
            <LanguageToggle />
          </div>
        </nav>
      </header>
      <main>
        <Suspense fallback={<p role="status">…</p>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/capture" element={<Capture />} />
            <Route path="/processing" element={<Processing />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={<DistrictDashboard />} />
            <Route path="*" element={<Link to="/">{t("back")}</Link>} />
          </Routes>
        </Suspense>
      </main>
      <footer>
        UDYAM SAATHI <span>{t("draft")}</span>
      </footer>
    </>
  );
}
