import { StyleSheet } from "react-native";

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  headerImage: {
    width: "100%",
    height: 260,
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    overflow: "hidden",
  },
  title: {
    textAlign: "center",
    marginBottom: 30,
    fontSize: 28,
  },
  emptyContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 60,
  },
  emptyText: {
    fontSize: 16,
    textAlign: "center",
    marginBottom: 20,
    opacity: 0.6,
  },
  alarmsList: {
    gap: 15,
    marginBottom: 20,
  },
  alarmCard: {
    backgroundColor: "#fff",
    borderRadius: 15,
    padding: 20,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    borderLeftWidth: 4,
    borderLeftColor: "#4CAF50",
  },
  alarmCardInactive: {
    opacity: 0.6,
    borderLeftColor: "#999",
  },
  alarmHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 15,
  },
  alarmTime: {
    fontSize: 48,
    fontWeight: "bold",
    color: "#4CAF50",
  },
  alarmTimeInactive: {
    color: "#999",
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
  },
  statusBadgeActive: {
    backgroundColor: "#E8F5E9",
  },
  statusBadgeInactive: {
    backgroundColor: "#f0f0f0",
  },
  statusText: {
    fontSize: 12,
    fontWeight: "600",
    color: "#333",
  },
  alarmDetails: {
    gap: 10,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  detailLabel: {
    fontSize: 16,
    width: 24,
  },
  detailValue: {
    fontSize: 14,
    color: "#666",
    flex: 1,
  },
  createButton: {
    backgroundColor: "#4CAF50",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 10,
  },
  createButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  deleteAllButton: {
    marginTop: 12,
    backgroundColor: "#D32F2F",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  deleteAllLabel: {
    color: "#fff",
    fontWeight: "700",
  },
});
