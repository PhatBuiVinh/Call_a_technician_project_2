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
import { Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import UrgentCallout from "./components/layout/UrgentCallout";
import Footer from "./components/layout/Footer";
import BackToTop from "./components/UI/BackToTop";
import ScrollToTop from "./components/UI/ScrollToTop";
import SeoManager from "./components/seo/SeoManager";

const Home = lazy(() => import("./pages/Home"));
const About = lazy(() => import("./pages/About"));
const Services = lazy(() => import("./pages/Services"));
const Location = lazy(() => import("./pages/Location"));
const Blog = lazy(() => import("./pages/Blog"));
const BlogPost = lazy(() => import("./pages/BlogPost"));
const Contact = lazy(() => import("./pages/contact"));
const Login = lazy(() => import("./pages/Login"));
const LiveChatButton = lazy(() => import("./components/UI/LiveChatButton"));

function PageFallback() {
  return (
    <div className="container-app py-12 text-slate-600 text-sm">
      Loading page...
    </div>
  );
}

export default function App() {
  return (
    <>
      <ScrollToTop />
      <SeoManager />
      <NavBar />
      <UrgentCallout persist="none"/> {/* sticky banner under the nav */}
      <div className="pt-24 md:pt-28">
        <Suspense fallback={<PageFallback />}>
          <Routes>
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
        </Suspense>
      </div>
      <Footer />
      <Suspense fallback={null}>
        <LiveChatButton />
      </Suspense>
      <BackToTop />
    </>
  );
}
