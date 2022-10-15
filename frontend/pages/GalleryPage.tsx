import React from "react";
import Gallery from "../components/Gallery";
import Footer from "../components/Footer";
import classes from "../components/styling/GalleryPage.module.sass";
import Menu from "../components/Menu";

function GalleryPage() {
  return (
    <div>
      <GalleryPageHeader/>
      <Gallery></Gallery>
      <Footer/>
    </div>
  );
}

const GalleryPageHeader: React.FC = () => {

  return(
    <div className={ classes.header }>
      <div className={ classes.header_blackbox }>
      </div>
      <p className={ classes.header_text}>No to compression artifacts.<br/>Yes to true fullscreen pictures.<br/>Take that *generic website service*</p>
      <br/><small className={ classes.header_thought}>(but especially Wix&trade; for their obnoxious ads I got while researching for this website).</small>
      <p className={ classes.header_greeting }><b>hope you enjoy,</b><br/>Markus</p>
      <Menu cname={classes.menu_position}/>
    </div>
  );
};

export default GalleryPage;
