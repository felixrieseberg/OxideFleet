#VEHICLES
--
##GET /vehicles - Returns all vehicles
 
### Sample Response:

```json
{ "data": [
    {
        "type": "vehicle",
        "name": "553ac59934dff597a9708c71",
        "id": "553ac59934dff597a9708c71",
        "is_active": true,
        "vin": "553ac59993884615b15b93d3",
        "make": "Toyota",
        "model": "Prius",
        "production_year": 2013,
        "mileage": "4,884.3",
        "links": {
            "self": "http://localhost:3000/vehicles/553ac59934dff597a9708c71",
            "trips": {
                "related": "http://localhost:3000/trips/553ac59934dff597a9708c71"
            }
        }
    },
    {
        "type": "vehicle",
        "name": "553ac59934dff597a9708c72",
        "id": "553ac59934dff597a9708c71",
        "is_active": true,
        "vin": "553ac59993884615b15b93d3",
        "make": "Toyota",
        "model": "Prius",
        "production_year": 2013,
        "mileage": "4,884.3",
        "links": {
            "self": "http://localhost:3000/vehicles/553ac59934dff597a9708c72",
            "trips": {
                "related": "http://localhost:3000/trips/553ac59934dff597a9708c71"
            }
        }
    }
]}
```
 
## GET /vehicles/:id - Returns an array of size 1 with the vehicle which mataches :id
 
### Sample Response:

```json
{ "data": [
    {
        "type": "vehicle",
        "name": "553ac59934dff597a9708c71",
        "id": "553ac59934dff597a9708c71",
        "is_active": true,
        "vin": "553ac59993884615b15b93d3",
        "make": "Toyota",
        "model": "Prius",
        "production_year": 2013,
        "mileage": "4,884.3",
        "links": {
            "self": "http://localhost:3000/vehicles/553ac59934dff597a9708c71",
            "trips": {
                "related": "http://localhost:3000/trips/553ac59934dff597a9708c71"
            }
        }
    }
]}
```

# TRIPS
--
## GET /vehicle/:id/trips - Returns all trip for a particular vehicle with :id
 
### Sample Response:
```json
{
    "data": [
        {
            "id": "acf3ba91-8ee0-4b64-814a-52df6bdad442",
            "type": "trip",
            "trip_events": [
                {
                    "id": "553ac599cb49af5c772f9982",
                    "event_type": "direction_change",
                    "timestamp": "2014-06-27T03:28:35 +07:00",
                    "speed": 8,
                    "location": {
                        "latitude": 56.649237,
                        "longitude": 136.74491,
                        "direction": 51,
                        "altitude": 681
                    }
                },
                {
                    "id": "553ac599685144ba00e7f8cb",
                    "event_type": "engine_stop",
                    "timestamp": "2014-05-22T07:05:24 +07:00",
                    "speed": 3,
                    "location": {
                        "latitude": -21.687184,
                        "longitude": -77.175881,
                        "direction": 158,
                        "altitude": 9
                    }
                }
            ],
            "links": {
                "self": "http://localhost:3000/vehicles/553ac59934dff597a9708c71/trip/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                "driver": {
                    "related":"http://localhost:3000/vehicles/553ac59934dff597a9708c71/trips/acf3ba91-8ee0-4b64-814a-52df6bdad442/driver"
                }
            }
        },
        {
            "id": "acf3ba91-8ee0-4b64-814a-52df6bdad443",
            "type": "trip",
            "trip_events": [
                {
                    "id": "553ac599cb49af5c772f9982",
                    "event_type": "direction_change",
                    "timestamp": "2014-06-27T03:28:35 +07:00",
                    "speed": 8,
                    "location": {
                        "latitude": 56.649237,
                        "longitude": 136.74491,
                        "direction": 51,
                        "altitude": 681
                    }
                },
                {
                    "id": "553ac599685144ba00e7f8cb",
                    "event_type": "engine_stop",
                    "timestamp": "2014-05-22T07:05:24 +07:00",
                    "speed": 3,
                    "location": {
                        "latitude": -21.687184,
                        "longitude": -77.175881,
                        "direction": 158,
                        "altitude": 9
                    }
                }
            ],
            "links": {
                "self": "http://localhost:3000/trips/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                "driver": {
                    "related":"http://localhost:3000/drivers/553ac59965094b476a817fa6"
                }
            }
        }
    ]
}
```

## GET /trips - Returns all trips
 
### Sample Resonse
```json
{
    "data": [
        {
            "id": "acf3ba91-8ee0-4b64-814a-52df6bdad442",
            "type": "trip",
            "trip_events": [
                {
                    "id": "553ac599cb49af5c772f9982",
                    "event_type": "direction_change",
                    "timestamp": "2014-06-27T03:28:35 +07:00",
                    "speed": 8,
                    "location": {
                        "latitude": 56.649237,
                        "longitude": 136.74491,
                        "direction": 51,
                        "altitude": 681
                    }
                },
                {
                    "id": "553ac599685144ba00e7f8cb",
                    "event_type": "engine_stop",
                    "timestamp": "2014-05-22T07:05:24 +07:00",
                    "speed": 3,
                    "location": {
                        "latitude": -21.687184,
                        "longitude": -77.175881,
                        "direction": 158,
                        "altitude": 9
                    }
                }
            ],
            "links": {
                "self": "http://localhost:3000/trips/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                "driver": {
                   "related":"http://localhost:3000/drivers/553ac59965094b476a817fa6"
            }
        },
        {
            "id": "acf3ba91-8ee0-4b64-814a-52df6bdad443",
            "type": "trip",
            "trip_events": [
                {
                    "id": "553ac599cb49af5c772f9982",
                    "event_type": "direction_change",
                    "timestamp": "2014-06-27T03:28:35 +07:00",
                    "speed": 8,
                    "location": {
                        "latitude": 56.649237,
                        "longitude": 136.74491,
                        "direction": 51,
                        "altitude": 681
                    }
                },
                {
                    "id": "553ac599685144ba00e7f8cb",
                    "event_type": "engine_stop",
                    "timestamp": "2014-05-22T07:05:24 +07:00",
                    "speed": 3,
                    "location": {
                        "latitude": -21.687184,
                        "longitude": -77.175881,
                        "direction": 158,
                        "altitude": 9
                    }
                }
            ],
            "links": {
                "self": "http://localhost:3000/trips/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                "driver": {
                    "related":"http://localhost:3000/drivers/553ac59965094b476a817fa6"
                }
            }
        }
    ]
}
```

## GET /trips/:id

### Sample Response

```json 
{
    "data": [
        {
            "id": "acf3ba91-8ee0-4b64-814a-52df6bdad442",
            "type": "trip",
            "trip_events": [
                {
                    "id": "553ac599cb49af5c772f9982",
                    "event_type": "direction_change",
                    "timestamp": "2014-06-27T03:28:35 +07:00",
                    "speed": 8,
                    "location": {
                        "latitude": 56.649237,
                        "longitude": 136.74491,
                        "direction": 51,
                        "altitude": 681
                    }
                },
                {
                    "id": "553ac599685144ba00e7f8cb",
                    "event_type": "engine_stop",
                    "timestamp": "2014-05-22T07:05:24 +07:00",
                    "speed": 3,
                    "location": {
                        "latitude": -21.687184,
                        "longitude": -77.175881,
                        "direction": 158,
                        "altitude": 9
                    }
                }
            ],
            "links": {
                "self": "http://localhost:3000/vehicles/553ac59934dff597a9708c71/trip/acf3ba91-8ee0-4b64-814a-52df6bdad442",
                "driver": {
                    "related":"http://localhost:3000/drivers/553ac59965094b476a817fa6"
                }
            }
        }
    ]
}
```
## Drivers
## GET /drivers - Returns all drivers

### Sample Response:
```json
{ 
    "data": [{
        "id": "553ac599580b76009c7bd482",
        "type": "driver",
        "name": "Manning, Gilliam"
    },
    {
        "id": "553ac599580b76009c7bd483",
        "type": "driver",
        "name": "Manning, Gil"
    }] 
}
```
 
## GET /drivers/:id - Returns a driver with specified :id

### Sample Response:

```json 
{ 
    "data": [{
        "id": "553ac599580b76009c7bd482",
        "type": "driver",
        "name": "Manning, Gilliam"
    }] 
}
```