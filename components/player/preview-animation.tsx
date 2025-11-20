import Svg, {
  Circle,
  Defs,
  LinearGradient,
  Stop,
  Text as SvgText,
} from "react-native-svg";

export const PreviewAnimation = ({
  previewProgress,
}: {
  previewProgress: number;
}) => {
  return (
    <Svg
      width={40}
      height={40}
      style={{
        position: "absolute",
        top: 0,
        left: -50,
      }}
    >
      <Defs>
        <LinearGradient id="cometGradient" x1="0%" y1="0%" x2="100%" y2="0%">
          <Stop offset="0%" stopColor="#4CAF50" stopOpacity="0.3" />
          <Stop offset="70%" stopColor="#4CAF50" stopOpacity="0.8" />
          <Stop offset="100%" stopColor="#81C784" stopOpacity="1" />
        </LinearGradient>
      </Defs>
      {/* Background trail */}
      <Circle
        cx={20}
        cy={20}
        r={18}
        stroke="#4CAF50"
        strokeWidth={2}
        fill="none"
        opacity={0.2}
        strokeDasharray={`${2 * Math.PI * 18}`}
        strokeDashoffset={`${2 * Math.PI * 18 * (1 - previewProgress)}`}
        rotation="-90"
        origin="20, 20"
      />
      {/* Main progress with gradient */}
      <Circle
        cx={20}
        cy={20}
        r={18}
        stroke="url(#cometGradient)"
        strokeWidth={3}
        fill="none"
        strokeDasharray={`${2 * Math.PI * 18}`}
        strokeDashoffset={`${2 * Math.PI * 18 * (1 - previewProgress)}`}
        rotation="-90"
        origin="20, 20"
        strokeLinecap="round"
      />
      {/* Glowing head */}
      <Circle
        cx={20}
        cy={20}
        r={18}
        stroke="#81C784"
        strokeWidth={1.5}
        fill="none"
        strokeDasharray={`8 ${2 * Math.PI * 18}`}
        strokeDashoffset={`${2 * Math.PI * 18 * (1 - previewProgress)}`}
        rotation="-90"
        origin="20, 20"
        opacity={0.8}
      />
      <SvgText
        x={20}
        y={20}
        textAnchor="middle"
        alignmentBaseline="central"
        fontSize={10}
        fill="#4CAF50"
        fontWeight="bold"
      >
        {Math.floor(previewProgress * 11)}s
      </SvgText>
    </Svg>
  );
};
