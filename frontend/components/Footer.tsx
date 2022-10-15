import React, { useState } from "react";
import classes from "./styling/Footer.module.sass";

const Footer: React.FC = () => {

    const [date, setDate] = useState(new Date());

  return (
    <div className={classes.container}>
      <p className={classes.text}> All Images by Markus Rink { date.getFullYear() }</p>
    </div>
  );
};

export default Footer;