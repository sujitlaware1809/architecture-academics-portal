from typing import Dict, Any, Optional

def success_response(data: Any = None, message: str = "Success") -> Dict[str, Any]:
    """Create a standardized success response"""
    response = {
        "success": True,
        "message": message
    }
    if data is not None:
        response["data"] = data
    return response

def error_response(message: str, error_code: Optional[str] = None, details: Any = None) -> Dict[str, Any]:
    """Create a standardized error response"""
    response = {
        "success": False,
        "message": message
    }
    if error_code:
        response["error_code"] = error_code
    if details:
        response["details"] = details
    return response

def paginated_response(
    data: list, 
    total: int, 
    page: int = 1, 
    limit: int = 50, 
    message: str = "Success"
) -> Dict[str, Any]:
    """Create a standardized paginated response"""
    return {
        "success": True,
        "message": message,
        "data": data,
        "pagination": {
            "total": total,
            "page": page,
            "limit": limit,
            "total_pages": (total + limit - 1) // limit if limit > 0 else 1,
            "has_next": (page * limit) < total,
            "has_prev": page > 1
        }
    }

def validate_pagination_params(skip: int = 0, limit: int = 50) -> tuple:
    """Validate and normalize pagination parameters"""
    # Ensure skip is not negative
    skip = max(0, skip)
    
    # Ensure limit is within reasonable bounds
    limit = max(1, min(limit, 200))
    
    # Calculate page number
    page = (skip // limit) + 1
    
    return skip, limit, page