import Footer from "./footer/Footer";
import Navbar from "./navbar/Navbar";

const Layout = ({ children }) => {
  return (
    <div className="min-h-screen bg-dark text-text flex flex-col">
      <Navbar />
      <main className="container mx-auto px-4 pt-8">{children}</main>
      <Footer />
    </div>
  );
};

export default Layout;
