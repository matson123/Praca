"""Simplified Poland border polygon for geofencing (point-in-polygon).

The polygon is a densified outline of the Polish territorial border (WGS84),
sufficient for validating that events are placed within Poland.
Coordinates are (longitude, latitude) tuples, ordered counter-clockwise.
"""

# Densified simplified polygon of Poland (approx 50 points).
POLAND_POLYGON = [
    (14.1229, 53.7570),  # NW corner near Szczecin
    (14.4127, 53.2836),
    (14.4108, 52.9819),
    (14.6236, 52.5776),
    (14.5697, 52.2820),
    (14.6957, 52.0898),
    (14.7601, 51.5290),
    (15.0169, 51.2732),
    (14.9948, 50.8582),
    (15.4900, 50.7860),
    (16.0028, 50.6103),
    (16.2069, 50.4230),
    (16.6816, 50.0977),
    (17.1520, 50.3826),
    (17.6474, 50.0491),
    (18.4034, 49.9227),
    (18.8332, 49.5100),
    (19.4633, 49.6116),
    (19.7526, 49.2054),
    (20.4159, 49.3900),
    (20.5877, 49.3543),
    (21.6076, 49.4708),
    (22.5581, 49.0857),
    (22.7156, 49.1739),
    (22.8582, 49.5361),
    (23.6416, 50.3103),
    (24.0298, 50.7050),
    (23.9270, 50.8712),
    (23.9270, 51.2360),
    (23.6081, 51.5171),
    (23.6416, 52.0000),
    (23.4854, 52.2000),
    (23.1741, 52.2887),
    (23.4854, 52.6084),
    (23.7986, 52.7112),
    (23.4854, 53.0000),
    (23.4854, 53.4700),
    (23.0844, 54.0350),
    (22.7156, 54.3564),
    (22.7156, 54.4235),
    (21.2683, 54.4235),
    (19.6084, 54.4600),
    (19.4633, 54.4600),
    (19.4633, 54.3564),
    (18.5340, 54.4600),
    (17.5138, 54.7500),
    (16.6816, 54.5540),
    (16.1893, 54.2537),
    (15.4900, 54.1000),
    (14.5697, 54.0489),
    (14.2103, 53.9137),
    (14.1229, 53.7570),
]


def is_in_poland(lat: float, lon: float) -> bool:
    """Ray casting point-in-polygon test.

    Returns True if the given (lat, lon) is inside the Poland polygon.
    """
    # Quick bounding box rejection.
    if not (49.0 <= lat <= 55.0 and 14.0 <= lon <= 24.2):
        return False

    inside = False
    n = len(POLAND_POLYGON)
    j = n - 1
    for i in range(n):
        xi, yi = POLAND_POLYGON[i]  # xi = lon, yi = lat
        xj, yj = POLAND_POLYGON[j]
        intersect = ((yi > lat) != (yj > lat)) and (
            lon < (xj - xi) * (lat - yi) / ((yj - yi) or 1e-12) + xi
        )
        if intersect:
            inside = not inside
        j = i
    return inside
