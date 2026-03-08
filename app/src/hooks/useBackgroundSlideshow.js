import { useState, useEffect } from 'react';

const backgrounds = [
  '0d1d2629f66eac95fb007caab1ced473.jpg',
  '115acf70f645191cca86539dc3d89ddc.jpg',
  '19ab8984a2ea3d6b50671eb04002398a.jpg',
  '2985da52866ca9ec64adb6ccf9698ba9.jpg',
  '3c2ae7d209bcf3bf88f7d4fbbf7b35e0.jpg',
  '68e41b8e918b49b87b155ad062bda4a4.jpg',
  '744de2612200edf0f22434b10f42d476.jpg',
  '85bd9102750e56bcb411476f2f796b10.jpg',
  '8d1cfca5b95022bccf8e386da88bcfc6.jpg',
  '8e5cd42e4ba96293b2412a3b68893dd9.jpg',
  '9176315f145ea60e11b9def4f46c2223.jpg',
  '93444a1b67f247462c64efd40c8cdabe.jpg',
  'a57b4c841e32ca75cbd2786d9e0ab900.jpg',
  'a7db2ba63e2f1df5772149e6c86fb5ec.jpg',
  'aa6063066b44983297050bded539f37b.jpg',
  'afe66a0ff6c9c6fdfc3b076b88ea9321.jpg',
  'b50ddea702639a9a6624696bf9cbee02.jpg',
  'b607d8108131291f89d3e3a4c2610e46.jpg',
  'cafa9148cb120de227b72a35dda62185.jpg',
  'de3213456e46c5d74a065f98eee2494f.jpg',
  'f7502be79c140e2bea555d4401c8182c.jpg',
];

export function useBackgroundSlideshow(intervalMs = 12000) {
  const [currentIndex, setCurrentIndex] = useState(() =>
    Math.floor(Math.random() * backgrounds.length)
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % backgrounds.length);
    }, intervalMs);
    return () => clearInterval(timer);
  }, [intervalMs]);

  return {
    currentImage: `/assets/backgrounds/${backgrounds[currentIndex]}`,
    nextImage: `/assets/backgrounds/${backgrounds[(currentIndex + 1) % backgrounds.length]}`,
  };
}
