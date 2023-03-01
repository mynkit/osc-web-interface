import React, { useState, useEffect, useRef } from 'react'
import useWebSocket, { ReadyState } from 'react-use-websocket';
import Slider from '@mui/material/Slider';
import Grid from '@mui/material/Grid';
import Box from '@mui/material/Box';
import { BsCloudRainHeavy, BsSoundwave } from 'react-icons/bs';
import { MdOutlineBubbleChart } from 'react-icons/md';
import { GiModernCity, GiHummingbird, GiSeagull, GiSwallow } from 'react-icons/gi';
import { FaDove, FaCrow } from 'react-icons/fa'
import Draggable from 'react-draggable';
import { useWindowDimensions } from './utils/windowDimensions';
import './App.css';

type XY = {
  x: number;
  y: number;
}

const map = (value: number, fromMin: number, fromMax: number, toMin: number, toMax: number) => {

  let result = 0;

  result = (value <= fromMin)
    ? toMin : (value >= fromMax)
      ? toMax : (() => {

        let ratio = (toMax - toMin) / (fromMax - fromMin);
        return (value - fromMin) * ratio + toMin;

      })();

  return result;

};

const Interface: React.FC = () => {
  // websocket周り
  const privateIp = process.env.REACT_APP_PRIVATE_IP ? process.env.REACT_APP_PRIVATE_IP : 'localhost'
  const socketUrl = `ws://${privateIp}:9001`
  const { sendJsonMessage, lastMessage, readyState } = useWebSocket(
    socketUrl, {
      shouldReconnect: (closeEvent) => true,
      onClose: () => {
        // 
      },
    }
  );
  const connectionStatus = {
    [ReadyState.CONNECTING]: 'Connecting',
    [ReadyState.OPEN]: 'Open',
    [ReadyState.CLOSING]: 'Closing',
    [ReadyState.CLOSED]: 'Closed',
    [ReadyState.UNINSTANTIATED]: 'Uninstantiated',
  }[readyState];
  // ドラッグ&ドロップ周り
  const nodeRef1 = useRef(null);
  const nodeRef2 = useRef(null);
  const nodeRef3 = useRef(null);

  // サイズ調整
  const { width, height } = useWindowDimensions();
  const cageWidth = Math.min(width, height) * 0.7;
  const iconSize = Math.min(cageWidth*0.15, 60);
  const minX = -cageWidth/2;
  const maxX = cageWidth/2 - iconSize;
  const minY = 0;
  const maxY = cageWidth - iconSize;

  // stateたち
  const [connectionId, setConnectionId] = useState('');
  const [sliderOn, setSliderOn] = useState(true);
  const [rainValue, setRainValue] = useState(0);
  const [pondValue, setPondValue] = useState(0);
  const [roadValue, setRoadValue] = useState(0);
  const [isDrag1, setIsDrag1] = useState(false);
  const [isDrag2, setIsDrag2] = useState(false);
  const [isDrag3, setIsDrag3] = useState(false);
  const [doveXY, setDoveXY] = useState<XY>({x: -cageWidth/2, y: 0})
  const [bird2XY, setBird2XY] = useState<XY>({x: cageWidth/2 - iconSize, y: 0})
  const [synthXY, setSynthXY] = useState<XY>({x: cageWidth/2 - iconSize, y: cageWidth - iconSize})
  const handleRainChange = (event: Event, value: number | number[], activeThumb: number) => {
    setRainValue(value as number);
    sendJsonMessage({"type":"rain","value":value as number / 100});
  };
  const handlePondChange = (event: Event, value: number | number[], activeThumb: number) => {
    setPondValue(value as number);
    sendJsonMessage({"type":"pond","value":value as number / 100});
  };
  const handleRoadChange = (event: Event, value: number | number[], activeThumb: number) => {
    setRoadValue(value as number);
    sendJsonMessage({"type":"road","value":value as number / 100});
  }
  const handleDrag1 = (event: any, data: any) => {
    if (data.x>minX && data.x<maxX && data.y>minY && data.y<maxY){
      setDoveXY({x: data.x, y: data.y});
      sendJsonMessage({"type":"dove","x": map(data.x, minX, maxX, 0, 1),"y": map(data.y, minY, maxY, 0, 1)});
    }
  }
  const handleDrag2 = (event: any, data: any) => {
    if (data.x>minX && data.x<maxX && data.y>minY && data.y<maxY){
      setBird2XY({x: data.x, y: data.y});
      sendJsonMessage({"type":"bird2","x": map(data.x, minX, maxX, 0, 1),"y": map(data.y, minY, maxY, 0, 1)});
    }
  }
  const handleDrag3 = (event: any, data: any) => {
    if (data.x>minX && data.x<maxX && data.y>minY && data.y<maxY){
      setSynthXY({x: data.x, y: data.y});
      sendJsonMessage({"type":"synth","x": map(data.x, minX, maxX, 0, 1),"y": map(data.y, minY, maxY, 0, 1)});
    }
  }
  useEffect(() => {
    console.log(`privateIp: ${privateIp}`);
  }, [privateIp])
  useEffect(() => {
    sendJsonMessage({"type":"access"});
  }, [])
  useEffect(() => {
    if (lastMessage) {
      const dataParsed = JSON.parse(lastMessage.data);
      if (dataParsed.type==='access') {
        setConnectionId(dataParsed.connectionId);
      }
      if (dataParsed.type==='rain') {
        setRainValue(dataParsed['value']*100);
      }
      if (dataParsed.type==='pond') {
        setPondValue(dataParsed['value']*100);
      }
      if (dataParsed.type==='road') {
        setRoadValue(dataParsed['value']*100);
      }
      if (dataParsed.type==='dove' && !isDrag1) {
        setDoveXY({x: map(dataParsed['x'], 0, 1, minX, maxX), y: map(dataParsed['y'], 0, 1, minY, maxY)});
      }
      if (dataParsed.type==='bird2' && !isDrag2) {
        setBird2XY({x: map(dataParsed['x'], 0, 1, minX, maxX), y: map(dataParsed['y'], 0, 1, minY, maxY)});
      }
      if (dataParsed.type==='synth' && !isDrag3) {
        setSynthXY({x: map(dataParsed['x'], 0, 1, minX, maxX), y: map(dataParsed['y'], 0, 1, minY, maxY)});
      }
    }
  }, [lastMessage])
  return (
    <div style={{padding: '10px'}}>
      <div style={{position: 'relative', width: '100%'}}>
        <div style={{position: 'absolute', left: '10px'}}>
          <span style={{fontSize: '10pt', color: 'red'}}>{connectionStatus==='Open' ? '': '接続が切れました。リロードしてください。'}</span>
        </div>
        <div style={{position: 'absolute', right: '10px'}}>
          <span style={{fontSize: '10pt'}}>connectionId: </span>
          {connectionId}
        </div>
      </div>
      <Box sx={{ width: '100%', paddingTop: '20px' }}>
        <Grid container spacing={2} alignItems="center" style={{width: '450px', maxWidth: '50%', padding: '5px'}}>
          <Grid item>
            <BsCloudRainHeavy size={`2em`} color={'inherit'}/>
          </Grid>
          <Grid item xs>
            <Slider value={rainValue} onChange={handleRainChange} disabled={!sliderOn}/>
          </Grid>
        </Grid>
        <Grid container spacing={2} alignItems="center" style={{width: '900px', maxWidth: '100%', padding: '5px'}}>
          <Grid item>
            {/* <MdWaves size={`2em`} color={booting ? 'inherit' : '#bdbdbd'}/> */}
            <MdOutlineBubbleChart size={`2em`} color={'inherit'}/>
          </Grid>
          <Grid item xs>
            <Slider value={pondValue} onChange={handlePondChange} disabled={!sliderOn}/>
          </Grid>
          <Grid item>
            {/* <BsRecordCircle size={`2em`} color={booting ? 'inherit' : '#bdbdbd'}/> */}
            <GiModernCity size={`2em`} color={'inherit'}/>
          </Grid>
          <Grid item xs>
            <Slider value={roadValue} onChange={handleRoadChange} disabled={!sliderOn}/>
          </Grid>
        </Grid>
      </Box>
      <Grid container justifyContent='center' style={{width: '100%', height: cageWidth, position: 'relative', padding: '20px'}}>
        <div style={{
          position: 'absolute',
          border: '1px solid #000000',
          width: cageWidth,
          height: cageWidth,
        }}/>
        <Draggable
          position={{x: doveXY.x, y: doveXY.y}}
          nodeRef={nodeRef1}
          onStart={()=>{setIsDrag1(true)}}
          onStop={()=>{setIsDrag1(false)}}
          onDrag={handleDrag1}
          scale={1}
          handle='b'>
          <div ref={nodeRef1} style={{ position: 'absolute', fontSize: iconSize, cursor: 'pointer', width: '0' }}>
            <b><FaDove/></b>
          </div>
        </Draggable>
        <Draggable
          position={{x: bird2XY.x, y: bird2XY.y}}
          nodeRef={nodeRef2}
          onStart={()=>{setIsDrag2(true)}}
          onStop={()=>{setIsDrag2(false)}}
          onDrag={handleDrag2}
          scale={1}
          handle='b'>
          <div ref={nodeRef2} style={{ position: 'absolute', fontSize: iconSize, cursor: 'pointer', width: '0' }}>
            <b><GiHummingbird/></b>
          </div>
        </Draggable>
        <Draggable
          position={{x: synthXY.x, y: synthXY.y}}
          nodeRef={nodeRef3}
          onStart={()=>{setIsDrag3(true)}}
          onStop={()=>{setIsDrag3(false)}}
          onDrag={handleDrag3}
          scale={1}
          handle='b'>
          <div ref={nodeRef3} style={{ position: 'absolute', fontSize: iconSize, cursor: 'pointer', width: '0', textAlign: 'center' }}>
            <b><BsSoundwave/></b>
          </div>
        </Draggable>
      </Grid>
    </div>
  )
}

const App: React.FC = () => {
  return (
    <Interface/>
  )
}

export default App;
