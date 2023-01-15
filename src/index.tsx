/**
 * @fileoverview
 * 此处的脚本将会在插件管理器加载插件期间被加载
 * 一般情况下只需要从这个入口点进行开发即可满足绝大部分需求
 */

import Player from "./soundProcessor/Player.js";
import { useLocalStorage } from "./hooks";
import VisualCanvas from "./soundProcessor/VisualCanvas";
import "./index.scss";
import * as React from "react";
import * as ReactDOM from "react-dom";
import { Button, Slider, Stack } from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import { ChromePicker } from "react-color";
let configElement;
const styleElement = document.createElement("style");
let canvasElement;
const canvasParent = document.createElement("div");

plugin.onLoad((selfPlugin) => {
    configElement = document.createElement("div");
    ReactDOM.render(<Menu />, configElement);

    styleElement.innerHTML = betterncm_native.fs.readFileText(
        `${selfPlugin.pluginPath}/index.css`,
    );
    document.head.appendChild(styleElement);
    canvasParent.classList.add("audioVisualizerCanvasParent");

    betterncm.utils.waitForElement(".g-singlec-ct").then((mainPlayer) => {
        mainPlayer?.appendChild(canvasParent);
    });

    let player;
    betterncm.utils.waitForElement(".btnp").then((btn) => {
        loadedPlugins.LibFrontendPlay.addEventListener(
            "updateCurrentAudioPlayer",
            (e) => {
                if (player) player.paused = true;
                player = new Player((e as CustomEvent).detail, [
                    new VisualCanvas(canvasElement, 0),
                    new VisualCanvas(undefined, btn),
                ]);
                player.play();
            },
        );
    });
});

declare var h: typeof React.createElement;
declare var f: typeof React.Fragment;

export let CurrentColor = {
    r: 255,
    g: 255,
    b: 255,
    a: 30,
};

function Menu() {
    const canvasRef = React.useRef(null);

    const btnColorRef = React.useRef<null | HTMLInputElement>(null);

    React.useEffect(() => {
        canvasElement = canvasRef.current;
    }, [canvasRef]);

    const [windowWH, setWindowWH] = React.useState([
        document.body.clientWidth,
        document.body.clientHeight,
    ]);

    const [mirrored, setMirrored] = useLocalStorage(
        "simpleaudiovisualizer.mirrored",
        false,
    );

    const [horizontal, setHorizontal] = useLocalStorage(
        "simpleaudiovisualizer.horizontal",
        false,
    );

    const [transformX, setTransformX] = useLocalStorage(
        "simpleaudiovisualizer.transformX",
        0,
    );

    const [transformY, setTransformY] = useLocalStorage(
        "simpleaudiovisualizer.transformY",
        0,
    );

    const [fixed, setFixed] = useLocalStorage(
        "simpleaudiovisualizer.fixed",
        false,
    );

    const [modifyMP, setModifyMP] = useLocalStorage(
        "simpleaudiovisualizer.modifyMP",
        false,
    );

    React.useEffect(()=>{
        setInterval(()=>{
            if(modifyMP){
                document.querySelector("#main-player")?.classList.add("audioVisualizerModifyMP");
            }else{
                document.querySelector("#main-player")?.classList.remove("audioVisualizerModifyMP")
            }
        },100);
    },[]);

    const [color, setColor] = useLocalStorage("simpleaudiovisualizer.color", {
        r: 255,
        g: 255,
        b: 255,
        a: 255,
    });

    React.useEffect(() => {
        CurrentColor = color;
    }, [color]);

    React.useEffect(() => {
        window.addEventListener("resize", () => {
            setWindowWH([
                document.body.clientWidth,
                document.body.clientHeight,
            ]);
        });
    }, []);

    return (
        <>
            <Stack spacing={2}>
                <div>
                    <Checkbox
                        checked={horizontal}
                        onChange={(_, v) => setHorizontal(v)}
                    />
                    <span>水平排列</span>

                    <Checkbox
                        checked={mirrored}
                        onChange={(_, v) => setMirrored(v)}
                    />
                    <span>对称</span>

                    <Checkbox
                        checked={fixed}
                        onChange={(_, v) => setFixed(v)}
                    />
                    <span>固定位置</span>

                    <Checkbox
                        checked={modifyMP}
                        onChange={(_, v) => setModifyMP(v)}
                    />
                    <span>修改播放栏</span>
                </div>

                <Stack
                    spacing={2}
                    direction="row"
                    sx={{ mb: 1 }}
                    alignItems="center"
                >
                    <span style={{ minWidth: "5em" }}>水平平移</span>
                    <Slider
                        min={-100}
                        max={100}
                        value={transformX}
                        onChange={(_, v) => setTransformX(v as number)}
                    />
                </Stack>

                <Stack
                    spacing={2}
                    direction="row"
                    sx={{ mb: 1 }}
                    alignItems="center"
                >
                    <span style={{ minWidth: "5em" }}>垂直平移</span>
                    <Slider
                        min={-100}
                        max={100}
                        value={transformY}
                        onChange={(_, v) => setTransformY(v as number)}
                    />
                </Stack>

                <div>
                    <ChromePicker
                        color={color}
                        onChange={(res) => setColor(res.rgb as any)}
                        disableAlpha={false}
                    />
                </div>
            </Stack>
            {ReactDOM.createPortal(
                <>
                    <canvas
                        ref={canvasRef}
                        style={{
                            transform: horizontal
                                ? `
                            rotate(90deg) translateY(${
                                mirrored ? -transformX : transformX - 100
                            }%)  translateX(${transformY}%) ${
                                      mirrored ? "scaleY(-1)" : ""
                                  }
                            `
                                : `
                            translateX(${transformX}%)  translateY(${
                                      mirrored ? 100 - transformY : transformY
                                  }%) ${mirrored ? "scaleY(-1)" : ""}
                            `,
                            position: fixed ? "fixed" : "absolute",
                        }}
                        className="audioVisualizerCanvas"
                    />
                </>,
                canvasParent,
            )}
        </>
    );
}

plugin.onConfig(() => {
    return configElement;
});
