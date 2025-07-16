import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  titleContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  stepContainer: {
    gap: 8,
    marginBottom: 8,
  },
  reactLogo: {
    backgroundSize: "cover",
    backgroundPosition: "center",
    height: "100%",
    width: "100%",
    position: "absolute",
    top: 0,
    left: 0,
  },
  alarm: {
    marginLeft: "10%",
    marginRight: "10%",
    marginTop: 0,
    marginBottom: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
  },
  alarmInput: {
    fontSize: 25,
    color: "#ccf",
  },
  options: {
    flex: 1,
    marginTop: 0,
    marginBottom: 0,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    gap: 10,
  },
  addButton: {
    padding: 5,
    color: "pink",
    width: 50,
    height: 50,
    inset: 0,
  },
  addButtonLabel: {
    fontSize: 38,
    fontWeight: "800",
    verticalAlign: "middle",
    textAlign: "center",
    top: 3.5,
  },
  optionsButton: {
    backgroundColor: "#C9EFDD",
    borderColor: "green",
    borderWidth: 1,
    padding: 10,
    width: "120%",
    height: "auto",
  },
  label: {
    fontWeight: "bold",
    textAlign: "center",
  },
  wrapperCustom: {
    borderRadius: 8,
    padding: 6,
  },
});

export default styles;
