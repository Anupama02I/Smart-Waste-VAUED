from fastapi import APIRouter, Query
from datetime import datetime, timedelta
from app.database import collection
router = APIRouter(prefix="/chatbot", tags=["Chatbot"])



def get_date_window(days: int = 7):
    latest_doc = collection.find_one(
        {},
        sort=[("time", -1)],
        projection={"time": 1}
    )

    if not latest_doc or not latest_doc.get("time"):
        return None, None

    latest_date = latest_doc["time"][:10]
    latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")
    start_dt = latest_dt - timedelta(days=max(1, int(days)) - 1)

    return start_dt.strftime("%Y-%m-%d"), latest_date


@router.get("/overview-summary")
def get_overview_summary(
    days: int = 7,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
):
    start_date, end_date = get_date_window(days)
    if not start_date or not end_date:
        return {
            "total_records": 0,
            "avg_risk": 0,
            "avg_temperature": 0,
            "avg_humidity": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
        }

    match_stage = {
        "date_only": {
            "$gte": start_date,
            "$lte": end_date
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    pipeline = [
        {
            "$addFields": {
                "date_only": {"$substrBytes": ["$time", 0, 10]},
                "odour_risk_num": {"$toDouble": "$odour_risk"},
                "temperature_num": {"$toDouble": "$temperature"},
                "humidity_num": {"$toDouble": "$humidity"}
            }
        },
        {"$match": match_stage},
        {
            "$group": {
                "_id": None,
                "total_records": {"$sum": 1},
                "avg_risk": {"$avg": "$odour_risk_num"},
                "avg_temperature": {"$avg": "$temperature_num"},
                "avg_humidity": {"$avg": "$humidity_num"},
                "high_count": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]}
                },
                "medium_count": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "Medium"]}, 1, 0]}
                },
                "low_count": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "Low"]}, 1, 0]}
                }
            }
        }
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    if not result:
        return {
            "total_records": 0,
            "avg_risk": 0,
            "avg_temperature": 0,
            "avg_humidity": 0,
            "high_count": 0,
            "medium_count": 0,
            "low_count": 0,
        }

    item = result[0]

    return {
        "total_records": item.get("total_records", 0),
        "avg_risk": round(float(item.get("avg_risk") or 0), 2),
        "avg_temperature": round(float(item.get("avg_temperature") or 0), 2),
        "avg_humidity": round(float(item.get("avg_humidity") or 0), 2),
        "high_count": item.get("high_count", 0),
        "medium_count": item.get("medium_count", 0),
        "low_count": item.get("low_count", 0),
    }



@router.get("/risk-trend")
def get_risk_trend(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
):
    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "date": {"$substrBytes": ["$time", 0, 10]},
                "odour_risk_num": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "avg_risk": {"$avg": "$odour_risk_num"}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "date": r["_id"],
            "avg_risk": round(r["avg_risk"], 2)
        }
        for r in result
    ]


@router.get("/zone-comparison")
def get_zone_comparison(
    days: int = 7,
    start: str = None,
    end: str = None,
    bin: str = Query("all"),
    severity: str = Query("all"),
):
    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "odour_risk_num": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$group": {
                "_id": "$location",
                "avg_risk": {"$avg": "$odour_risk_num"}
            }
        },
        {"$sort": {"avg_risk": -1}}
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "zone": r["_id"],
            "avg_risk": round(r["avg_risk"], 2)
        }
        for r in result
    ]


@router.get("/bin-ranking")
def get_bin_ranking(
    date: str,
    zone: str = Query(...),   # required
    limit: int = 5
):
    # -----------------------------
    # VALIDATION
    # -----------------------------
    if not date or not zone:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "location": zone,
        "$expr": {
            "$eq": [
                {"$substrBytes": ["$time", 0, 10]},
                date
            ]
        }
    }

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "odour_risk_num": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$group": {
                "_id": "$bin_id",
                "avg_risk": {"$avg": "$odour_risk_num"}
            }
        },
        {"$sort": {"avg_risk": -1}},
        {"$limit": int(limit)}
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "bin": r["_id"],
            "avg_risk": round(r["avg_risk"], 2)
        }
        for r in result
    ]

@router.get("/metrics-trends")
def get_metrics_trends(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
):
    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "date": {"$substrBytes": ["$time", 0, 10]},
                "temperature_num": {"$toDouble": "$temperature"},
                "humidity_num": {"$toDouble": "$humidity"},
                "methane_num": {"$toDouble": "$methane"},
                "ammonia_num": {"$toDouble": "$ammonia"}
            }
        },
        {
            "$group": {
                "_id": "$date",
                "temperature": {"$avg": "$temperature_num"},
                "humidity": {"$avg": "$humidity_num"},
                "methane": {"$avg": "$methane_num"},
                "ammonia": {"$avg": "$ammonia_num"}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "date": r["_id"],
            "temperature": round(r["temperature"], 2),
            "humidity": round(r["humidity"], 2),
            "methane": round(r["methane"], 2),
            "ammonia": round(r["ammonia"], 2),
        }
        for r in result
    ]


@router.get("/alerts-summary")
def get_alerts_summary(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
):
    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return {
            "total_alerts": 0,
            "high_alerts": 0,
            "medium_alerts": 0,
            "low_alerts": 0,
            "unresolved_alerts": 0,
        }

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$group": {
                "_id": None,
                "total_alerts": {"$sum": 1},
                "high_alerts": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]}
                },
                "medium_alerts": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "Medium"]}, 1, 0]}
                },
                "low_alerts": {
                    "$sum": {"$cond": [{"$eq": ["$risk_level", "Low"]}, 1, 0]}
                },
                "unresolved_alerts": {
                    "$sum": {
                        "$cond": [
                            {
                                "$ne": [
                                    {"$ifNull": ["$alert_status", "Active"]},
                                    "Resolved"
                                ]
                            },
                            1,
                            0
                        ]
                    }
                }
            }
        }
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    if not result:
        return {
            "total_alerts": 0,
            "high_alerts": 0,
            "medium_alerts": 0,
            "low_alerts": 0,
            "unresolved_alerts": 0,
        }

    item = result[0]

    return {
        "total_alerts": item.get("total_alerts", 0),
        "high_alerts": item.get("high_alerts", 0),
        "medium_alerts": item.get("medium_alerts", 0),
        "low_alerts": item.get("low_alerts", 0),
        "unresolved_alerts": item.get("unresolved_alerts", 0),
    }


@router.get("/alerts")
def get_alerts(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
    status: str = Query("all"),
    limit: int = 50
):
    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    if status != "all":
        if status == "Active":
            match_stage["$or"] = [
                {"alert_status": "Active"},
                {"alert_status": {"$exists": False}},
                {"alert_status": None}
            ]
        else:
            match_stage["alert_status"] = status

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "odour_risk_num": {"$toDouble": "$odour_risk"}
            }
        },
        {"$sort": {"time": -1}},
        {"$limit": int(limit)},
        {
            "$project": {
                "_id": 1,
                "time": 1,
                "bin_id": 1,
                "location": 1,
                "odour_risk": "$odour_risk_num",
                "risk_level": 1,
                "status": {"$ifNull": ["$alert_status", "Active"]}
            }
        }
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "alert_id": str(r["_id"]),
            "bin_id": r.get("bin_id"),
            "location": r.get("location"),
            "time": r.get("time"),
            "odour_risk": round(float(r.get("odour_risk", 0)), 2),
            "risk_level": r.get("risk_level", "Low"),
            "status": r.get("status", "Active")
        }
        for r in result
    ]


@router.get("/scatter")
def get_scatter_data(
    metric: str = "methane",
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
    limit: int = 100
):
    # -----------------------------
    # VALIDATE METRIC
    # -----------------------------
    allowed_metrics = ["temperature", "humidity", "methane", "ammonia"]

    if metric not in allowed_metrics:
        return {"error": "Invalid metric"}

    # -----------------------------
    # DATE RANGE
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        start_date, end_date = get_date_window(days)

    if not start_date or not end_date:
        return []

    # -----------------------------
    # MATCH STAGE
    # -----------------------------
    match_stage = {
        "$expr": {
            "$and": [
                {
                    "$gte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        start_date
                    ]
                },
                {
                    "$lte": [
                        {"$substrBytes": ["$time", 0, 10]},
                        end_date
                    ]
                }
            ]
        }
    }

    if zone != "all":
        match_stage["location"] = zone

    if bin != "all":
        match_stage["bin_id"] = bin

    if severity != "all":
        match_stage["risk_level"] = severity

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {"$match": match_stage},
        {
            "$addFields": {
                "x_value": {"$toDouble": f"${metric}"},
                "y_value": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "x": "$x_value",
                "y": "$y_value"
            }
        },
        {"$limit": int(limit)}
    ]

    result = list(collection.aggregate(pipeline, allowDiskUse=True))

    return [
        {
            "x": round(r["x"], 2),
            "y": round(r["y"], 2)
        }
        for r in result if r.get("x") is not None and r.get("y") is not None
    ]



@router.get("/context-insight")
def get_context_insight(
    page: str = Query("overview"),
    zone: str = Query("all"),
    bin: str = Query("all"),
    timeRange: str = Query("7"),
    severity: str = Query("all"),
    metric: str = Query("methane")
):
    insight = {
        "summary": "",
        "reason": "",
        "suggestion": ""
    }

    # -----------------------------
    # OVERVIEW PAGE
    # -----------------------------
    if page == "overview":
        insight["summary"] = f"Overview for last {timeRange} days."
        insight["reason"] = "General environmental conditions are being monitored."
        insight["suggestion"] = "Focus on zones showing higher trends."

    # -----------------------------
    # RISK PAGE
    # -----------------------------
    elif page == "risk":
        if severity == "High":
            insight["summary"] = f"High risk detected in {zone}."
            insight["reason"] = f"{metric.capitalize()} levels may be contributing."
            insight["suggestion"] = "Take immediate action and monitor conditions."
        elif severity == "Medium":
            insight["summary"] = f"Moderate risk in {zone}."
            insight["reason"] = "Environmental factors are slightly elevated."
            insight["suggestion"] = "Continue monitoring."
        else:
            insight["summary"] = f"Low risk in {zone}."
            insight["reason"] = "Conditions are stable."
            insight["suggestion"] = "No immediate action required."

    # -----------------------------
    # ALERTS PAGE
    # -----------------------------
    elif page == "alerts":
        insight["summary"] = f"Alerts in {zone}."
        insight["reason"] = f"Filtered by severity: {severity}."
        insight["suggestion"] = "Review unresolved alerts and take action."

    return insight