// import { Routes, Route } from "react-router-dom";
// import NavBar from "./components/layout/NavBar";
// import Footer from "./components/layout/Footer";
// import Home from "./pages/Home";
// import About from "./pages/About";
// import Services from "./pages/Services";
// import Location from "./pages/Location";
// import Blog from "./pages/Blog";
// import Contact from "./pages/contact";
// import Login from "./pages/Login";

// export default function App() {
//   return (
//     <>
//       <NavBar />
//       <div className="pt-24 md:pt-28">
//         <Routes>
//           <Route path="/" element={<Home />} />
//           <Route path="/about" element={<About />} />
//           <Route path="/services" element={<Services />} />
//           <Route path="/location" element={<Location />} />
//           <Route path="/blog" element={<Blog />} />
//           <Route path="/contact" element={<Contact />} />
//           <Route path="/login" element={<Login />} />
//           <Route path="*" element={<Home />} />
//         </Routes>
//       </div>
//       <Footer />
//     </>
//   );
// }

import { Suspense, lazy } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { AnimatePresence, LayoutGroup, motion } from "framer-motion";
import NavBar from "./components/layout/NavBar";
import UrgentCallout from "./components/layout/UrgentCallout";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/UI/BackToTop";
import ScrollToTop from "./components/UI/ScrollToTop";
import MobileStickyCTA from "./components/UI/MobileStickyCTA";
import AccessibilitySettings from "./components/UI/AccessibilitySettings";
import SeoManager from "./components/seo/SeoManager";
import { useMotionPreference } from "./contexts/MotionPreferenceContext";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Location = lazy(() => import("./pages/Location"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/contact"));
const Login = lazy(() => import("./pages/Login"));
const LiveChatButton = lazy(() => import("./components/UI/LiveChatButton"));
const TRANSITION_PATHS = new Set(["/", "/about", "/services"]);

function PageFallback() {
  return (
    <div className="container-app py-12 text-slate-600 text-sm">
      Loading page...
    </div>
  );
}

export default function App() {
  const location = useLocation();
  const { reduceMotion, motionIntensity } = useMotionPreference();
  const subtle = motionIntensity === "subtle";
  const shouldAnimateRoute = !reduceMotion && TRANSITION_PATHS.has(location.pathname);
  const routeKey = shouldAnimateRoute ? location.pathname : "static-route";
  const routeInitial = subtle
    ? { opacity: 0, y: 7, filter: "blur(2px)" }
    : { opacity: 0, y: 14, filter: "blur(6px)" };
  const routeExit = subtle
    ? { opacity: 0, y: -6, filter: "blur(1px)" }
    : { opacity: 0, y: -10, filter: "blur(4px)" };
  const routeTransition = subtle
    ? { duration: 0.22, ease: [0.22, 1, 0.36, 1] }
    : { duration: 0.38, ease: [0.22, 1, 0.36, 1] };

  return (
    <>
      <ScrollToTop />
      <SeoManager />
      <NavBar />
      <UrgentCallout persist="none"/> {/* sticky banner under the nav */}
      <div className="pt-24 md:pt-28">
        <Suspense fallback={<PageFallback />}>
          <LayoutGroup id="site-shared-layout">
            <AnimatePresence mode="sync" initial={false}>
              <motion.div
                key={routeKey}
                initial={shouldAnimateRoute ? routeInitial : false}
                animate={shouldAnimateRoute ? { opacity: 1, y: 0, filter: "blur(0px)" } : { opacity: 1 }}
                exit={shouldAnimateRoute ? routeExit : { opacity: 1 }}
                transition={shouldAnimateRoute ? routeTransition : { duration: 0 }}
              >
                <Routes location={location}>
                  <Route path="/" element={<Home />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/services" element={<Services />} />
                  <Route path="/location" element={<Location />} />
                  <Route path="/blog" element={<Blog />} />
                  <Route path="/blog/:id" element={<BlogPost />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="*" element={<Home />} />
                </Routes>
              </motion.div>
            </AnimatePresence>
          </LayoutGroup>
        </Suspense>
      </div>
      <Footer />
      <Suspense fallback={null}>
        <LiveChatButton />
      </Suspense>
      <MobileStickyCTA />
      <AccessibilitySettings />
      <BackToTop />
    </>
  );
}
