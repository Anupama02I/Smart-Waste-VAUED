from fastapi import APIRouter
from app.database import collection
from datetime import datetime, timedelta
from fastapi import APIRouter, Query, HTTPException
from bson import ObjectId


router = APIRouter(prefix="/data", tags=["Data"])

# Get all data (limited)
@router.get("/")
def get_data():
    data = list(collection.find().limit(1000))
    
    for item in data:
        item["_id"] = str(item["_id"])
    
    return data

# Filter by risk level
@router.get("/risk/{level}")
def get_by_risk(level: str):
    data = list(collection.find({"risk_level": level}))
    
    for item in data:
        item["_id"] = str(item["_id"])
    
    return data

# Get high risk summary
@router.get("/high-risk")
def high_risk():
    count = collection.count_documents({"risk_level": "High"})
    return {"high_risk_count": count}

@router.get("/kpi/daily")
def get_daily_kpi(date: str):

    start = f"{date} 00:00:00"
    end = f"{date} 23:59:59"

    pipeline = [
        {
            "$match": {
                "time": {
                    "$gte": start,
                    "$lte": end
                }
            }
        },
        {
            "$addFields": {
                "odour_risk": {"$toDouble": "$odour_risk"},
                "temperature": {"$toDouble": "$temperature"},
                "humidity": {"$toDouble": "$humidity"}
            }
        },
        {
            "$group": {
                "_id": None,
                "avg_risk": {"$avg": "$odour_risk"},
                "avg_temp": {"$avg": "$temperature"},
                "avg_humidity": {"$avg": "$humidity"},
                "high_risk": {
                    "$sum": {
                        "$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]
                    }
                }
            }
        }
    ]

    result = list(collection.aggregate(pipeline))

    return result[0] if result else {
        "avg_risk": 0,
        "avg_temp": 0,
        "avg_humidity": 0,
        "high_risk": 0
    }
    

@router.get("/trend")
def get_trend(date: str):

    start = f"{date} 00:00:00"
    end = f"{date} 23:59:59"

    pipeline = [
        {
            "$match": {
                "time": {
                    "$gte": start,
                    "$lte": end
                }
            }
        },

        {
            "$addFields": {
                "odour_risk": {"$toDouble": "$odour_risk"},

                # Extract hour safely
                "hour": {
                    "$toInt": {
                        "$substr": ["$time", 11, 2]
                    }
                }
            }
        },

        {
            "$addFields": {
                "time_bucket": {
                    "$subtract": ["$hour", {"$mod": ["$hour", 2]}]
                }
            }
        },

        {
            "$group": {
                "_id": "$time_bucket",
                "avg_risk": {"$avg": "$odour_risk"},
                "high_count": {
                    "$sum": {
                        "$cond": [{"$eq": ["$risk_level", "High"]}, 1, 0]
                    }
                }
            }
        },

        {"$sort": {"_id": 1}}
    ]

    result = list(collection.aggregate(pipeline))

    return [
        {
            "time": f"{item['_id']:02d}:00",
            "avg_risk": round(item["avg_risk"], 2),
            "high_count": item["high_count"]
        }
        for item in result
    ]

@router.get("/bin-ranking")
def get_bin_ranking(date: str, zone: str):
    pipeline = [
        {
            "$addFields": {
                "date_only": {"$substrBytes": ["$time", 0, 10]},
                "odour_risk_num": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$match": {
                "date_only": date,
                "location": zone
            }
        },
        {
            "$group": {
                "_id": "$bin_id",
                "avg_risk": {"$avg": "$odour_risk_num"}
            }
        },
        {
            "$sort": {"avg_risk": -1, "_id": 1}
        }
    ]

    result = list(collection.aggregate(pipeline))

    return [
        {
            "bin": item["_id"],
            "avg_risk": round(item["avg_risk"], 2)
        }
        for item in result
    ]

@router.get("/bin-summary")
def get_bin_summary(date: str, zone: str, bin_id: str):
    pipeline = [
        {
            "$addFields": {
                "date_only": {"$substrBytes": ["$time", 0, 10]},
                "odour_risk_num": {"$toDouble": "$odour_risk"},
                "temperature_num": {"$toDouble": "$temperature"},
                "humidity_num": {"$toDouble": "$humidity"},
                "methane_num": {"$toDouble": "$methane"},
                "ammonia_num": {"$toDouble": "$ammonia"},
                "co2_num": {"$toDouble": "$CO2_ppm"},
                "co_num": {"$toDouble": "$CO_ppm"},
                "no2_num": {"$toDouble": "$NO2_ppm"},
                "pm25_num": {"$toDouble": "$PM2_5_ug_m3"},
                "o3_num": {"$toDouble": "$O3_ug_m3"},
            }
        },
        {
            "$match": {
                "date_only": date,
                "location": zone,
                "bin_id": bin_id
            }
        },
        {
            "$group": {
                "_id": "$bin_id",
                "zone": {"$first": "$location"},
                "date": {"$first": "$date_only"},
                "sampleCount": {"$sum": 1},
                "avgRisk": {"$avg": "$odour_risk_num"},
                "temperature": {"$avg": "$temperature_num"},
                "humidity": {"$avg": "$humidity_num"},
                "methane": {"$avg": "$methane_num"},
                "ammonia": {"$avg": "$ammonia_num"},
                "co2": {"$avg": "$co2_num"},
                "co": {"$avg": "$co_num"},
                "no2": {"$avg": "$no2_num"},
                "pm25": {"$avg": "$pm25_num"},
                "o3": {"$avg": "$o3_num"}
            }
        }
    ]

    result = list(collection.aggregate(pipeline))

    if not result:
        return None

    item = result[0]
    avg_risk = float(item.get("avgRisk") or 0)

    if avg_risk >= 35:
        risk_level = "High"
    elif avg_risk >= 28:
        risk_level = "Medium"
    else:
        risk_level = "Low"

    return {
        "binId": item["_id"],
        "zone": item["zone"],
        "date": item["date"],
        "sampleCount": item["sampleCount"],
        "temperature": round(float(item.get("temperature") or 0), 2),
        "humidity": round(float(item.get("humidity") or 0), 2),
        "methane": round(float(item.get("methane") or 0), 2),
        "ammonia": round(float(item.get("ammonia") or 0), 2),
        "co2": round(float(item.get("co2") or 0), 2),
        "co": round(float(item.get("co") or 0), 2),
        "no2": round(float(item.get("no2") or 0), 2),
        "pm25": round(float(item.get("pm25") or 0), 2),
        "o3": round(float(item.get("o3") or 0), 2),
        "avgRisk": round(avg_risk, 2),
        "riskLevel": risk_level
    }



@router.get("/risk-trend")
def get_risk_trend(
    days: int = 30,
    bin: str = Query("all"),
    risk: str = Query("all")
):
    # -----------------------------
    # Get latest date in DB
    # -----------------------------
    latest_doc = collection.find_one(
        {},
        sort=[("time", -1)],
        projection={"time": 1}
    )

    if not latest_doc or not latest_doc.get("time"):
        return []

    latest_date = latest_doc["time"][:10]
    latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")

    start_dt = latest_dt - timedelta(days=days - 1)
    start_date = start_dt.strftime("%Y-%m-%d")

    # -----------------------------
    # MATCH STAGE ( FIX)
    # -----------------------------
    match_stage = {
        "date": {
            "$gte": start_date,
            "$lte": latest_date
        }
    }

    # Filter by bin
    if bin and bin != "all":
        match_stage["bin_id"] = bin

    # -----------------------------
    # PIPELINE
    # -----------------------------
    pipeline = [
        {
            "$addFields": {
                "date": {"$substrBytes": ["$time", 0, 10]},
                "odour_risk": {"$toDouble": "$odour_risk"}
            }
        },

        #  APPLY FILTER HERE
        {
            "$match": match_stage
        },

        # Aggregate by date
        {
            "$group": {
                "_id": "$date",
                "avg_risk": {"$avg": "$odour_risk"}
            }
        },

        # Sort by date ascending
        {
            "$sort": {"_id": 1}
        }
    ]

    result = list(collection.aggregate(pipeline))

    return [
        {
            "date": r["_id"],
            "avg_risk": round(r["avg_risk"], 2)
        }
        for r in result
    ]


@router.get("/risk-distribution")
def get_risk_distribution(
    days: int = 30,
    start: str = None,
    end: str = None,
    bin: str = Query("all"),
    risk: str = Query("all")
):
    # -----------------------------
    # Determine date range
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        latest_doc = collection.find_one({}, sort=[("time", -1)], projection={"time": 1})

        if not latest_doc or not latest_doc.get("time"):
            return []

        latest_date = latest_doc["time"][:10]
        latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")

        start_dt = latest_dt - timedelta(days=days - 1)
        start_date = start_dt.strftime("%Y-%m-%d")
        end_date = latest_date

    # -----------------------------
    # MATCH STAGE 
    # -----------------------------
    match_stage = {
        "time": {
            "$gte": f"{start_date} 00:00:00",
            "$lte": f"{end_date} 23:59:59"
        }
    }

    #  Bin filter
    if bin and bin != "all":
        match_stage["bin_id"] = bin

    #  Risk filter
    if risk and risk != "all":
        match_stage["risk_level"] = risk

    # -----------------------------
    # PIPELINE ( OPTIMIZED)
    # -----------------------------
    pipeline = [
        {"$match": match_stage},

        # Only keep required field (faster)
        {
            "$project": {
                "risk_level": 1
            }
        },

        {
            "$group": {
                "_id": "$risk_level",
                "count": {"$sum": 1}
            }
        }
    ]

    result = list(collection.aggregate(pipeline))

    return [
        {"level": r["_id"], "count": r["count"]}
        for r in result
    ]

@router.get("/zone-risk")
def get_zone_risk(start: str = None, end: str = None):

    match_stage = {}
    if start and end:
        match_stage = {
            "time": {
                "$gte": f"{start} 00:00:00",
                "$lte": f"{end} 23:59:59"
            }
        }

    pipeline = [
        {"$match": match_stage} if match_stage else {},
        {
            "$addFields": {
                "odour_risk": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$group": {
                "_id": "$location",
                "avg_risk": {"$avg": "$odour_risk"}
            }
        },
        {"$sort": {"avg_risk": -1}}
    ]

    result = list(collection.aggregate([p for p in pipeline if p]))

    return [
        {
            "zone": r["_id"],
            "avg_risk": round(r["avg_risk"], 2)
        }
        for r in result
    ]



@router.get("/metrics-trend")
def get_metrics_trend(
    days: int = 30,
    start: str = None,
    end: str = None,
    bin: str = Query("all"),
    risk: str = Query("all")
):
    # -----------------------------
    # Determine date range
    # -----------------------------
    if start and end:
        start_date = start
        end_date = end
    else:
        latest_doc = collection.find_one(
            {},
            sort=[("time", -1)],
            projection={"time": 1}
        )

        if not latest_doc or not latest_doc.get("time"):
            return []

        latest_date = latest_doc["time"][:10]
        latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")

        start_dt = latest_dt - timedelta(days=days - 1)
        start_date = start_dt.strftime("%Y-%m-%d")
        end_date = latest_date

    # -----------------------------
    # MATCH STAGE 
    # -----------------------------
    match_stage = {
        "time": {
            "$gte": f"{start_date} 00:00:00",
            "$lte": f"{end_date} 23:59:59"
        }
    }

    #  Bin filter
    if bin and bin != "all":
        match_stage["bin_id"] = bin

    #  Risk filter
    if risk and risk != "all":
        match_stage["risk_level"] = risk

    # -----------------------------
    # PIPELINE (OPTIMIZED)
    # -----------------------------
    pipeline = [
        {"$match": match_stage},

        #  Convert + reduce fields early
        {
            "$project": {
                "date": {"$substrBytes": ["$time", 0, 10]},
                "temperature": {"$toDouble": "$temperature"},
                "humidity": {"$toDouble": "$humidity"},
                "methane": {"$toDouble": "$methane"},
                "ammonia": {"$toDouble": "$ammonia"},
            }
        },

        {
            "$group": {
                "_id": "$date",
                "temperature": {"$avg": "$temperature"},
                "humidity": {"$avg": "$humidity"},
                "methane": {"$avg": "$methane"},
                "ammonia": {"$avg": "$ammonia"},
            }
        },

        {"$sort": {"_id": 1}}
    ]

    result = list(collection.aggregate(pipeline))

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




import random

@router.get("/scatter")
def get_scatter(metric: str = "temperature", days: int = 30, limit: int = 50):

    metric_map = {
        "temperature": "$temperature",
        "humidity": "$humidity",
        "methane": "$methane",
        "ammonia": "$ammonia"
    }

    field = metric_map.get(metric, "$temperature")

    pipeline = [
        {
            "$addFields": {
                "x": {"$toDouble": field},
                "y": {"$toDouble": "$odour_risk"}
            }
        },
        {
            "$project": {
                "_id": 0,
                "x": 1,
                "y": 1,
                "risk_level": 1
            }
        }
    ]

    data = list(collection.aggregate(pipeline))

    #  LIMIT POINTS (important for performance)
    if len(data) > limit:
        data = random.sample(data, limit)

    return data



SEVERITY_ORDER = {
    "High": 3,
    "Medium": 2,
    "Low": 1
}

def get_latest_date():
    latest_doc = collection.find_one(
        {},
        sort=[("time", -1)],
        projection={"time": 1}
    )
    if not latest_doc or not latest_doc.get("time"):
        return None
    return latest_doc["time"][:10]

def apply_date_filter(days: int = 30, start: str = None, end: str = None):
    if start and end:
        return start, end

    latest_date = get_latest_date()
    if not latest_date:
        return None, None

    latest_dt = datetime.strptime(latest_date, "%Y-%m-%d")
    start_dt = latest_dt - timedelta(days=max(1, int(days)) - 1)
    return start_dt.strftime("%Y-%m-%d"), latest_date

def build_alert_message(risk_level: str) -> str:
    if risk_level == "High":
        return "High odour risk detected. Immediate attention required."
    if risk_level == "Medium":
        return "Moderate odour risk detected. Monitor this bin closely."
    return "Low odour risk. Normal monitoring condition."


from fastapi import Query

@router.get("/alerts")
def get_alerts(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all"),
    severity: str = Query("all"),
    status: str = Query("all"),
    limit: int = 200
):
    start_date, end_date = apply_date_filter(days=days, start=start, end=end)
    if not start_date or not end_date:
        return []

    # -----------------------------
    # BASE MATCH (date + filters)
    # -----------------------------
    base_match = {
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
        base_match["location"] = zone

    if bin != "all":
        base_match["bin_id"] = bin

    if status != "all":
        base_match["alert_status"] = status

    # -----------------------------
    # COMMON PIPELINE PART
    # -----------------------------
    def get_pipeline(match_stage, lvl_limit):
        return [
            {"$addFields": {
                "odour_risk": {"$toDouble": "$odour_risk"},
                "temperature": {"$toDouble": "$temperature"},
                "humidity": {"$toDouble": "$humidity"},
                "methane": {"$toDouble": "$methane"},
                "ammonia": {"$toDouble": "$ammonia"}
            }},
            {"$match": match_stage},
            {"$sort": {"time": -1}},
            {"$limit": lvl_limit},
            {
                "$project": {
                    "_id": 1,
                    "time": 1,
                    "bin_id": 1,
                    "location": 1,
                    "temperature": 1,
                    "humidity": 1,
                    "methane": 1,
                    "ammonia": 1,
                    "odour_risk": 1,
                    "risk_level": 1,
                    "alert_status": {"$ifNull": ["$alert_status", "Active"]}
                }
            }
        ]

    # -----------------------------
    # IF SPECIFIC SEVERITY SELECTED
    # -----------------------------
    if severity != "all":
        match_stage = base_match.copy()
        match_stage["risk_level"] = severity

        result = list(collection.aggregate(
            get_pipeline(match_stage, limit),
            allowDiskUse=True
        ))

    # -----------------------------
    # BALANCED SAMPLING (ALL LEVELS)
    # -----------------------------
    else:
        high_limit = int(limit * 0.3)    # 60
        medium_limit = int(limit * 0.4)  # 80
        low_limit = int(limit * 0.3)     # 60

        high_match = base_match.copy()
        high_match["risk_level"] = "High"

        medium_match = base_match.copy()
        medium_match["risk_level"] = "Medium"

        low_match = base_match.copy()
        low_match["risk_level"] = "Low"

        high_data = list(collection.aggregate(
            get_pipeline(high_match, high_limit),
            allowDiskUse=True
        ))

        medium_data = list(collection.aggregate(
            get_pipeline(medium_match, medium_limit),
            allowDiskUse=True
        ))

        low_data = list(collection.aggregate(
            get_pipeline(low_match, low_limit),
            allowDiskUse=True
        ))

        result = high_data + medium_data + low_data

    # -----------------------------
    # RESPONSE FORMAT
    # -----------------------------
    alerts = []
    for item in result:
        alerts.append({
            "alert_id": str(item["_id"]),
            "bin_id": item.get("bin_id"),
            "location": item.get("location"),
            "time": item.get("time"),
            "temperature": item.get("temperature"),
            "humidity": item.get("humidity"),
            "methane": item.get("methane"),
            "ammonia": item.get("ammonia"),
            "odour_risk": round(float(item.get("odour_risk", 0)), 2)
                if item.get("odour_risk") is not None else 0,
            "risk_level": item.get("risk_level", "Low"),
            "status": item.get("alert_status", "Active"),
            "title": f'{item.get("risk_level", "Low")} Alert',
            "message": build_alert_message(item.get("risk_level", "Low"))
        })

    return alerts

@router.get("/alerts/summary")
def get_alerts_summary(
    days: int = 7,
    start: str = None,
    end: str = None,
    zone: str = Query("all"),
    bin: str = Query("all")
):
    start_date, end_date = apply_date_filter(days=days, start=start, end=end)
    if not start_date or not end_date:
        return {
            "total_alerts": 0,
            "high_alerts": 0,
            "medium_alerts": 0,
            "low_alerts": 0,
            "unresolved_alerts": 0
        }

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
            "unresolved_alerts": 0
        }

    item = result[0]
    return {
        "total_alerts": item.get("total_alerts", 0),
        "high_alerts": item.get("high_alerts", 0),
        "medium_alerts": item.get("medium_alerts", 0),
        "low_alerts": item.get("low_alerts", 0),
        "unresolved_alerts": item.get("unresolved_alerts", 0)
    }


@router.patch("/alerts/{alert_id}/acknowledge")
def acknowledge_alert(alert_id: str):
    try:
        result = collection.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "alert_status": "Acknowledged",
                    "acknowledged_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert id")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {"message": "Alert acknowledged"}


@router.patch("/alerts/{alert_id}/resolve")
def resolve_alert(alert_id: str):
    try:
        result = collection.update_one(
            {"_id": ObjectId(alert_id)},
            {
                "$set": {
                    "alert_status": "Resolved",
                    "resolved_at": datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S")
                }
            }
        )
    except Exception:
        raise HTTPException(status_code=400, detail="Invalid alert id")

    if result.matched_count == 0:
        raise HTTPException(status_code=404, detail="Alert not found")

    return {"message": "Alert resolved"}