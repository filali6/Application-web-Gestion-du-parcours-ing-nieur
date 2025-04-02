import React, { useState, useEffect } from "react";
import { Card, Tabs, Tab, Button } from "react-bootstrap";
import { format } from "date-fns";
import {
  getAllPeriods,
  getPeriodById,
  addPeriod,
  updatePeriod,
} from "../../../services/period";
import PeriodTable from "./PeriodTable";
import PeriodForm from "./PeriodForm";

const periodTypes = [
  { value: "pfa", label: "PFA for Teachers" },
  { value: "stageEte", label: "Summer Internship" },
  { value: "choicePFA", label: "PFA for Students" },
];

function ManagePeriode() {
  const [periods, setPeriods] = useState([]);
  const [selectedPeriod, setSelectedPeriod] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [activeTab, setActiveTab] = useState("all");

  useEffect(() => {
    fetchPeriods();
  }, []);

  const fetchPeriods = async () => {
    try {
      const response = await getAllPeriods();
      setPeriods(response.periods || []);
    } catch (error) {
      console.error("Error fetching periods:", error);
    }
  };

  const handleAddPeriod = async (periodData) => {
    try {
      await addPeriod(periodData);
      await fetchPeriods();
      return { success: true };
    } catch (error) {
      throw error;
    }
  };

  const handleUpdatePeriod = async (id, updatedData) => {
    try {
      await updatePeriod(id, updatedData);
      await fetchPeriods();
      setIsEditing(false);
    } catch (error) {
      throw error;
    }
  };
  
  return (
    <div className="container">
      
      <div className="row align-items-start">  {/* Added align-items-start */}
        {/* Table section - takes more space */}
        <div className="col-lg-8 pe-lg-3">  {/* Added right padding on lg screens */}
          <Tabs
            activeKey={activeTab}
            onSelect={(k) => setActiveTab(k)}
            id="period-tabs"
            className="mb-3"
          >
            {/* Tab content remains the same */}
            <Tab eventKey="all" title="All Periods">
              <PeriodTable
                periods={periods}
                periodTypes={periodTypes}
                onEdit={(period) => {
                  setSelectedPeriod(period);
                  setIsEditing(true);
                }}
              />
            </Tab>
            {periodTypes.map((type) => (
              <Tab key={type.value} eventKey={type.value} title={type.label}>
                <PeriodTable
                  periods={periods.filter((p) => p.type === type.value)}
                  periodTypes={periodTypes}
                  onEdit={(period) => {
                    setSelectedPeriod(period);
                    setIsEditing(true);
                  }}
                />
              </Tab>
            ))}
          </Tabs>
        </div>
  
        {/* Form card section - fixed width */}
        <div className="col-lg-4 ps-lg-2  mt-5">  {/* Added left padding and sticky positioning */}
          <Card style={{ top: '20px' }}>  {/* Added small top offset */}
            <Card.Body>
              {isEditing ? (
                <PeriodForm
                  initialData={selectedPeriod}
                  onSubmit={(data) =>
                    handleUpdatePeriod(selectedPeriod._id, data)
                  }
                  onCancel={() => setIsEditing(false)}
                />
              ) : (
                <PeriodForm onSubmit={handleAddPeriod} />
              )}
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
}

export default ManagePeriode;
