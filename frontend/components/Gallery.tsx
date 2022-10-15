import React, { useEffect, useState } from "react";
import { animated, useSpring } from "@react-spring/web";
import classes from "./styling/Gallery.module.sass";
import FsLightbox from "fslightbox-react";
const contentful = require("contentful");

interface ServiceInit {
  status: "init";
}

interface ServiceLoading {
  status: "loading";
}

interface ServiceLoaded<T> {
  status: "loaded";
  payload: T;
}

interface ServiceError {
  status: "error";
  error: Error;
}

export type Service<T> =
  | ServiceInit
  | ServiceLoading
  | ServiceLoaded<T>
  | ServiceError;

interface ImageFormat {
  source: string;
  width: number;
  height?: number;
  extension: string;
}

interface ImageSrc {
  w200?: ImageFormat;
  w500?: ImageFormat;
  w1300?: ImageFormat;
  w2000?: ImageFormat;
  original: ImageFormat;
}

interface GallerImageProps {
  images: Array<{
    id: string;
    ranking: number;
    source: ImageSrc;
  }>;
}

interface ContentfulGalleryResponse {
  sys: {
    id: string;
  };
  fields: {
    title: string;
    images: [
      {
        sys: {
          id: string;
        };
        fields: {
          title: string;
          file: {
            contentType: string;
            fileName: string;
            url: string;
            details: {
              image: {
                width: number;
                height: number;
              };
            };
          };
        };
      }
    ];
  };
}

const Gallery: React.FC = () => {
  const [images, setImages] = useState<Service<GallerImageProps>>({
    status: "loading",
  });
  const [tmpImgIdx, settmpImgIdx] = useState(0);
  const [openGallery, toggleGallery] = useState(false); // value has no meaning, updating on change

  // fetch images
  useEffect(() => {
    const client = contentful.createClient({
      space: "",
      accessToken: "",
      host: "https://cdn.contentful.com",
    });

    client
      .getEntry("3O5JJIcHpHq570zseYwomx")
      .then((response: ContentfulGalleryResponse) => {
        let fetchedImages: GallerImageProps = { images: [] };
        response.fields.images.map((image, index) => {
          let w200: ImageFormat | undefined = undefined;
          let w500: ImageFormat | undefined = undefined;
          let w1300: ImageFormat | undefined = undefined;
          let w2000: ImageFormat | undefined = undefined;
          let orig: ImageFormat | undefined = undefined;
          orig = {
            source: "https:" + image.fields.file.url,
            width: image.fields.file.details.image.width,
            height: image.fields.file.details.image.height,
            extension: image.fields.file.contentType,
          };
          w200 = {
            source: "https:" + image.fields.file.url + "?w=200&h=200&q=70",
            width: 200,
            extension: image.fields.file.contentType,
          };
          w500 = {
            source: "https:" + image.fields.file.url + "?w=500&h=500&q=80",
            width: 500,
            extension: image.fields.file.contentType,
          };
          w1300 = {
            source: "https:" + image.fields.file.url + "?w=1300&h=1300&q=90",
            width: 1300,
            extension: image.fields.file.contentType,
          };
          w2000 = {
            source: "https:" + image.fields.file.url + "?w=2000&h=2000&q=90",
            width: 2000,
            extension: image.fields.file.contentType,
          };
          fetchedImages.images.push({
            id: image.sys.id,
            ranking: index,
            source: {
              original: orig,
              w200: w200,
              w500: w500,
              w1300: w1300,
              w2000: w2000,
            },
          });
        });
        setImages({ status: "loaded", payload: fetchedImages });
      });
  }, []);

  /* useEffect(() => {
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape"){
        toggleGallery(false);
      }
    })
  }, []) */

  if (images.status === "error") {
    return (
      <div>
        <p> Loading images failed! {console.log(images.error)} </p>
      </div>
    );
  } else if (images.status === "loaded") {
    return (
      <div>
        <FsLightbox
          sourceIndex={tmpImgIdx}
          sources={images.payload.images.map(({ source }) =>
            source.w2000 ? source.w2000.source : source.original.source
          )}
          toggler={openGallery}
        ></FsLightbox>

        <div className={classes.gallery}>
          {images.payload.images.map((image, index) => (
            <GalleryCell
              imgID={image.id}
              key={image.id}
              cellIndex={index}
              source={image.source}
              click={(idx) => {
                settmpImgIdx(idx);
                toggleGallery(!openGallery);
              }}
            />
          ))}
        </div>
      </div>
    );
  } else if (images.status === "loading") {
    return (
      <div>
        <h2 className={classes.loading_text}>{images.status}</h2>
      </div>
    );
  } else {
    return <div></div>;
  }
};

const GalleryCell: React.FC<{
  imgID?: string;
  source: ImageSrc;
  cellIndex: number;
  click: (id: number) => void;
}> = ({ click, source, cellIndex, imgID }) => {
  const props = useSpring({
    y: 0,
    config: {
      mass: 1,
      tension: 100,
      friction: 10,
      clamp: true,
    },
  });

  return (
    <animated.div style={props} className={classes.square}>
      <div className={classes.content}>
        <span className={classes.helper}></span>
        <img
          id={imgID}
          tabIndex={0}
          className={classes.gallery_image}
          src={source.original.source}
          srcSet={
            (source.w200 !== undefined ? source.w200.source + " 200w," : "") +
            (source.w500 !== undefined ? source.w500.source + " 500w," : "") +
            (source.w1300 !== undefined ? source.w1300.source + " 1300w" : "") +
            (source.w2000 !== undefined ? source.w2000.source + " 2000w" : "")
          }
          draggable="false"
          alt=""
          onClick={(event) => {
            click(cellIndex);
            props.y.start(-100);
          }}
          onKeyDown={(event) => {
            if (event.key === "Enter") click(cellIndex);
          }}
        ></img>
      </div>
    </animated.div>
  );
};

export default Gallery;
