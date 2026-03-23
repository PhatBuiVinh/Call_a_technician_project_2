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

import { Routes, Route } from "react-router-dom";
import NavBar from "./components/layout/NavBar";
import UrgentCallout from "./components/layout/UrgentCallout";
import Footer from "./components/layout/Footer";
import LiveChatButton from "./components/UI/LiveChatButton";
import BackToTop from "./components/UI/BackToTop";
import ScrollToTop from "./components/UI/ScrollToTop";
import Home from "./pages/Home";
import About from "./pages/About";
import Services from "./pages/Services";
import Location from "./pages/Location";
import Blog from "./pages/Blog";
import BlogPost from "./pages/BlogPost";
import Contact from "./pages/contact";   // ← use consistent casing
import Login from "./pages/Login";

export default function App() {
  return (
    <>
      <ScrollToTop />
      <NavBar />
      <UrgentCallout persist="none"/> {/* sticky banner under the nav */}
      <div className="pt-24 md:pt-28">
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
      </div>
      <Footer />
      <LiveChatButton />
      <BackToTop />
    </>
  );
}
