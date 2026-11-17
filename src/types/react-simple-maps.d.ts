// Types for the parts of react-simple-maps 3 this site uses (the package ships none).
declare module 'react-simple-maps' {
  import * as React from 'react';

  export interface ComposableMapProps extends React.SVGProps<SVGSVGElement> {
    width?: number;
    height?: number;
    projection?: string | ((...args: unknown[]) => unknown);
    projectionConfig?: {
      scale?: number;
      center?: [number, number];
      rotate?: [number, number, number];
      parallels?: [number, number];
    };
    children?: React.ReactNode;
  }
  export const ComposableMap: React.FC<ComposableMapProps>;

  export interface Position {
    coordinates: [number, number];
    zoom: number;
  }
  export interface ZoomableGroupProps extends Omit<React.SVGProps<SVGGElement>, 'center'> {
    center?: [number, number];
    zoom?: number;
    minZoom?: number;
    maxZoom?: number;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    filterZoomEvent?: (event: any) => boolean;
    onMoveStart?: (position: Position, event: unknown) => void;
    onMove?: (position: Position, event: unknown) => void;
    onMoveEnd?: (position: Position, event: unknown) => void;
    children?: React.ReactNode;
  }
  export const ZoomableGroup: React.FC<ZoomableGroupProps>;

  export interface Geo {
    rsmKey: string;
    /** The projected outline, as the path's d attribute */
    svgPath: string;
    id?: string | number;
    properties?: { name?: string };
  }
  export interface GeographiesProps {
    geography: string | Record<string, unknown>;
    /** `path` is d3's geoPath for the map's projection, in the map's own units */
    children: (props: { geographies: Geo[]; path: { bounds: (geo: Geo) => [[number, number], [number, number]] } }) => React.ReactNode;
  }
  export const Geographies: React.FC<GeographiesProps>;

  export interface GeographyProps extends Omit<React.SVGProps<SVGPathElement>, 'style'> {
    geography: Geo;
    style?: { default?: React.CSSProperties; hover?: React.CSSProperties; pressed?: React.CSSProperties };
  }
  export const Geography: React.FC<GeographyProps>;

  export interface SphereProps extends React.SVGProps<SVGPathElement> {
    id: string;
  }
  export const Sphere: React.FC<SphereProps>;
}
