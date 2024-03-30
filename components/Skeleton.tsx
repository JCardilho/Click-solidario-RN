import ContentLoader, { Rect, Circle } from 'react-content-loader/native';
import { useWindowDimensions } from 'react-native';

type TVariant = 'list' | 'unique';

interface IProps {
  contentLoaderProps?: typeof ContentLoader extends React.ComponentType<infer P> ? P : never;
  variant?: IVariant;
}

interface IVariant {
  variant: TVariant;
  list: number;
}

export const Skeleton = (props: IProps) => {
  const { width, height } = useWindowDimensions();

  return (
    <ContentLoader {...props.contentLoaderProps} backgroundColor="#d5d5d5" foregroundColor="#999">
      {props.variant?.variant === 'list' && (
        <>
          {Array.from(Array(props.variant.list).keys()).map((item, index) => (
            <Rect key={index} rx="4" ry="4" width={width} height={500} y={index * 50} />
          ))}
        </>
      )}
      {(props.variant?.variant === 'unique' || !props.variant) && (
        <>
          <Rect rx="4" ry="4" width={width} height={100} />
        </>
      )}
    </ContentLoader>
  );
};

export const SkeletonContent = (
  props?: typeof ContentLoader extends React.ComponentType<infer P> ? P : never
) => {
  return (
    <ContentLoader {...props} backgroundColor="#d5d5d5" foregroundColor="#999">
      {props?.children}
    </ContentLoader>
  );
};

export const SkeletonRect = (
  props?: typeof Rect extends React.ComponentType<infer P> ? P : never
) => {
  const { width, height } = useWindowDimensions();

  return <Rect {...props} width={width} rx="4" ry="4" />;
};
