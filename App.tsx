import { StatusBar } from 'expo-status-bar';
import React, {ForwardedRef, RefObject} from 'react';
import {StyleSheet, Text, View, Dimensions, FlatList, Animated, Image, findNodeHandle} from 'react-native';
import WithAnimatedObject = Animated.WithAnimatedObject;

const {width, height} = Dimensions.get('screen')

type ImagesObjType = {
  [key: string]: string
}
const images: ImagesObjType = {
  man:
      'https://images.pexels.com/photos/3147528/pexels-photo-3147528.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  women:
      'https://images.pexels.com/photos/2552130/pexels-photo-2552130.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  kids:
      'https://images.pexels.com/photos/5080167/pexels-photo-5080167.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  skullcandy:
      'https://images.pexels.com/photos/5602879/pexels-photo-5602879.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
  help:
      'https://images.pexels.com/photos/2552130/pexels-photo-2552130.jpeg?auto=compress&cs=tinysrgb&dpr=2&w=500',
};
type DataType = {
  key: string
  title: string
  image: string
  ref: RefObject<View>
}
const data: WithAnimatedObject<DataType>[] = Object.keys(images).map((i) => ({
  key: i,
  title: i,
  image: images[i],
  ref: React.createRef()
}));

type TabPropsType = {
  item: WithAnimatedObject<DataType>
}


const Tab = React.forwardRef<View, TabPropsType>(({item}: TabPropsType, ref) => {
  return <View ref={ref}>
    <Text style={{
      color: 'white',
      fontSize: 84/data.length,
      fontWeight: '800',
      textTransform: 'uppercase'
    }}>{item.title}</Text>
  </View>
})

type IndicatorPropsType = {
  measures: MeasuresType[]
  scrollX: Animated.Value
}

const Indicator = ({measures, scrollX}: IndicatorPropsType) => {
  const inputRange = data.map((_, index) => index * width);

  const indicatorWidth = scrollX.interpolate({
    inputRange,
    outputRange: measures.map((measure) => measure.width)
  })

  const translateX = scrollX.interpolate({
    inputRange,
    outputRange: measures.map((measure: any) => measure.x)
  })
  return <Animated.View style={{
    position: 'absolute',
    height: 4,
    width: indicatorWidth,
    left: 0,
    backgroundColor: 'white',
    bottom: -10,
    transform: [
      {translateX}
    ]
  }}/>
}

type TabsPropsType = {
  data: WithAnimatedObject<DataType>[]
  scrollX: Animated.Value
}

type MeasuresType = {
  x: number
  y: number
  width: number
  height: number

}

const Tabs = ({data, scrollX}: TabsPropsType) => {
  const [measures, setMeasures] = React.useState<MeasuresType[]>([])

  const containerRef = React.useRef<any>()
  React.useEffect(() => {
    let m: MeasuresType[] = []
    data.forEach((item1: any) => {
      item1.ref.current.measureLayout(
          containerRef.current,
          (x: number,y: number,width: number, height: number) => {
            if (containerRef.current) {
              m.push({
                x, y, width, height
              })
              if (m.length === data.length) {
                console.log('m.length === data.length')
                setMeasures(m)
              }
            }
          })
    })
  },[])
  console.log('render')
  console.log('render', measures.length)
  console.log('render', measures.length > 0)
  //console.log(measures)

  //if (measures.length < 1) return (<View><View><Text>Loading....</Text></View></View>)

  return <View style={{position: 'absolute', top: 100, width}}>
    <View
        ref={containerRef}
        style={{justifyContent: 'space-evenly', flex: 1, flexDirection: 'row'}}
    >
      {data.map((item) => {
        return (<React.Fragment key={item.key.toString()}>
              <Tab item={item} ref={item.ref}/>
            </React.Fragment>

        )
      })}
    </View>
    {measures.length > 0 && <Indicator measures={measures} scrollX={scrollX}/>}
  </View>
}


export default function App() {
  const scrollX = React.useRef(new Animated.Value(0)).current
  return (
      <View style={styles.container}>
        <StatusBar hidden />
        <Animated.FlatList
            data={data}
            keyExtractor={item => item.key.toString()}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            onScroll={Animated.event(
                [{nativeEvent: {contentOffset: {x: scrollX}}}],
                {useNativeDriver: false}
            )}
            renderItem={({item}) => {
              return <View style={{width, height}}>
                <Image
                    source={{uri: item.image.toString()}}
                    style={{flex: 1, resizeMode: 'cover'}}
                />
                <View style={[StyleSheet.absoluteFillObject, {backgroundColor: 'rgba(0,0,0,0.3)'}]}/>
              </View>
            }}
        />
        <Tabs data={data} scrollX={scrollX}/>
      </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
