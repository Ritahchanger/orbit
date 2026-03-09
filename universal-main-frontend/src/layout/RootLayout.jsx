import Footer from "./footer/Footer";
import Navbar from "./navbar/Navbar";

const RootLayout = ({ children }) => {
  return (
    <div>
      <Navbar />
      {children}
      <Footer/>
    </div>
  );
};

export default RootLayout;
