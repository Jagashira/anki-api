import React from "react";
import Image from "next/image";
const imageContainer = ({ img, word }) => {
  return (
    <div>
      {img ? (
        <div>
          <Image src={img} alt={word} width={500} height={500} />
        </div>
      ) : null}
    </div>
  );
};

export default imageContainer;
