import {StatusBar} from 'expo-status-bar';
import React, {useRef} from 'react';
import {
    StyleSheet,
    Text,
    View,
    Dimensions,
    Animated,
    Image,
    LayoutChangeEvent,
    useColorScheme, FlatList, TouchableOpacity
} from 'react-native';
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
    ref: any
}

const data: WithAnimatedObject<DataType>[] = Object.keys(images).map((i) => ({
    key: i,
    title: i,
    image: images[i],
    ref: React.createRef(),
}));

type TabPropsType = {
    item: WithAnimatedObject<DataType>
    onItemPress: () => void
}


const Tab = React.forwardRef<View, TabPropsType>(({item, onItemPress}: TabPropsType, ref) => {
    return (
        <TouchableOpacity  onPress={onItemPress}>
            <View ref={ref}>
                <Text style={{
                    color: 'white',
                    fontSize: 84 / data.length,
                    fontWeight: '800',
                    textTransform: 'uppercase'
                }}>
                    {item.title}
                </Text>
            </View>
        </TouchableOpacity>
    )
})

type IndicatorPropsType = {
    measures: MeasuresType[]
    scrollX: Animated.Value
}

const Indicator = ({measures, scrollX}: IndicatorPropsType) => {
    const theme = useColorScheme();
    console.log(theme)
    const inputRange = data.map((_, index) => index * width);

    const indicatorWidth = scrollX.interpolate({
        inputRange,
        outputRange: measures.map((measure) => measure.width)
    })


    const translateX = scrollX.interpolate({
        inputRange,
        outputRange: measures.map((measure) => measure.x)
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
    onItemPress: (itemIndex: number) => void
}

type MeasuresType = {
    x: number
    y: number
    width: number
    height: number
}


const Tabs = ({data, scrollX, onItemPress}: TabsPropsType) => {
    const [measures, setMeasures] = React.useState<MeasuresType[]>([])

    const containerRef = React.useRef<View | null>(null)
    let m: MeasuresType[] = []
    // React.useEffect(() => {
    //   data.forEach((item1) => {
    //     if (item1 && item1.ref)
    //     item1.ref.current.measureLayout(
    //         containerRef.current,
    //         (x: number,y: number,width: number, height: number) => {
    //           if (containerRef.current) {
    //             m.push({
    //               x, y, width, height
    //             })
    //             if (m.length === data.length) {
    //               console.log('m.length === data.length')
    //               //console.log('m', m)
    //               //setMeasures(m)
    //             }
    //           }
    //         })
    //
    //   })
    //
    // },[])

    const getLayout = (event: LayoutChangeEvent) => {
        //console.log('setMeasure')
        m.push({
            x: event.nativeEvent.layout.x,
            y: event.nativeEvent.layout.y,
            height: event.nativeEvent.layout.height,
            width: event.nativeEvent.layout.width,
        })
        if (m.length === data.length) {
            //console.log('m.length === data.length')
            //console.log('m', m)
            const sorting = m
                .sort((a, b) => a.x - b.x)
                .map((el) => el)
            //console.log('sorting', sorting)
            setMeasures(sorting)
        }

    }
    //console.log('measures', measures)
    //console.log('render')
    return <View style={{position: 'absolute', top: 100, width: data.length > 5 ? (width * 1.2) : width}}>
        <View
            ref={containerRef}
            style={{justifyContent: 'space-evenly', flex: 1, flexDirection: 'row'}}
        >
            {data.map((item,index) => {
                return (<View key={item.key.toString()} onLayout={getLayout}>
                        <Tab item={item} ref={item.ref} onItemPress={() => onItemPress(index)}/>
                    </View>

                )
            })}
        </View>
        {measures.length > 0 && <Indicator measures={measures} scrollX={scrollX}/>}
    </View>
}


export default function App() {
    const scrollX = React.useRef(new Animated.Value(0)).current
    const ref = useRef<FlatList<WithAnimatedObject<DataType>> | null>(null)

    const onItemPress = React.useCallback((itemIndex) => {
        if (ref && ref.current) {
            ref.current?.scrollToOffset({
                offset: itemIndex * width
            })
        }
    }, [])

    return (
        <View style={styles.container}>
            <StatusBar hidden/>
            <Animated.FlatList
                ref={ref}
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
            <Tabs data={data} scrollX={scrollX} onItemPress={onItemPress}/>
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
