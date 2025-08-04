import assets from "assets";
import React, { useState } from "react";
import { ImageBackground, ImageBackgroundProps } from "react-native";

export default function SafeImageBackground(props: ImageBackgroundProps) {
  const [error, setError] = useState(false);

  const source =
    error || !props.source ? assets.Fallback.FallbackImg : props.source;

  return (
    <ImageBackground {...props} source={source} onError={() => setError(true)}>
      {props.children}
    </ImageBackground>
  );
}
