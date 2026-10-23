
from typing import Literal

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel, ConfigDict, Field

from ai_ml.src.predict_diabetes import (
    FEATURES,
    predict_diabetes_label_probability,
)

router = APIRouter(
    prefix="/ml-research",
    tags=["Experimental ML Research"],
)


class CDCResearchInput(BaseModel):
    model_config = ConfigDict(extra="forbid")

    HighBP: Literal[0, 1]
    HighChol: Literal[0, 1]
    CholCheck: Literal[0, 1]
    BMI: float = Field(ge=12, le=100)
    Smoker: Literal[0, 1]
    Stroke: Literal[0, 1]
    HeartDiseaseorAttack: Literal[0, 1]
    PhysActivity: Literal[0, 1]
    Fruits: Literal[0, 1]
    Veggies: Literal[0, 1]
    HvyAlcoholConsump: Literal[0, 1]
    AnyHealthcare: Literal[0, 1]
    NoDocbcCost: Literal[0, 1]
    GenHlth: int = Field(ge=1, le=5)
    MentHlth: int = Field(ge=0, le=30)
    PhysHlth: int = Field(ge=0, le=30)
    DiffWalk: Literal[0, 1]
    Sex: Literal[0, 1]
    Age: int = Field(ge=1, le=13)
    Education: int = Field(ge=1, le=6)
    Income: int = Field(ge=1, le=8)


@router.post("/diabetes-label")
def predict_cdc_diabetes_label(data: CDCResearchInput):
    """Experimental CDC survey-label classification, not clinical risk."""
    try:
        result = predict_diabetes_label_probability(
            data.model_dump()
        )
        return result
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc)) from exc
