import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "uquiz",
    short_name: "uquiz",
    description:
      "Turn YouTube links into custom courses and generate quizzes on the fly.",
    start_url: "/",
    display: "standalone",
    background_color: "#faf9f7",
    theme_color: "#d0342c",
    icons: [
      {
        src: "/uquiz.jpg",
        sizes: "512x512",
        type: "image/jpeg",
      },
    ],
  };
}
