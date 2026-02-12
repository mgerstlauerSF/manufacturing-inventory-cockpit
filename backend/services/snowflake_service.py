import os
import snowflake.connector
from typing import List, Dict, Any, Optional
import logging

logger = logging.getLogger(__name__)

class SnowflakeService:
    def __init__(self):
        self.connection_name = os.getenv("SNOWFLAKE_CONNECTION_NAME", "default")
        self.database = os.getenv("SNOWFLAKE_DATABASE", "MANUFACTURING_DEMO")
        self.schema = os.getenv("SNOWFLAKE_SCHEMA", "INVENTORY")
        self._connection: Optional[snowflake.connector.SnowflakeConnection] = None
    
    def _get_connection(self) -> snowflake.connector.SnowflakeConnection:
        if self._connection is None or self._connection.is_closed():
            self._connection = snowflake.connector.connect(
                connection_name=self.connection_name,
                database=self.database,
                schema=self.schema,
            )
        return self._connection
    
    def close(self):
        if self._connection and not self._connection.is_closed():
            self._connection.close()
            self._connection = None
    
    def execute_query(
        self, 
        query: str, 
        params: Optional[Dict[str, Any]] = None,
        timeout: int = 60
    ) -> List[Dict[str, Any]]:
        conn = self._get_connection()
        cursor = conn.cursor()
        try:
            cursor.execute(f"ALTER SESSION SET STATEMENT_TIMEOUT_IN_SECONDS = {timeout}")
            
            if params:
                cursor.execute(query, params)
            else:
                cursor.execute(query)
            
            columns = [col[0] for col in cursor.description]
            return [dict(zip(columns, row)) for row in cursor.fetchall()]
        finally:
            cursor.close()

    def get_plants(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.PLANTS")

    def get_bom(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.BOM")

    def get_inventory(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.INVENTORY")

    def get_financials(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.FINANCIALS")

    def get_providers_3pl(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.PROVIDERS_3PL")

    def get_scenarios(self) -> List[Dict[str, Any]]:
        return self.execute_query(f"SELECT * FROM {self.database}.{self.schema}.SAVED_SCENARIOS ORDER BY CREATED_AT DESC")

    def save_scenario(self, scenario: Dict[str, Any]) -> Dict[str, Any]:
        from datetime import datetime
        scenario_id = f"SCN-{datetime.now().strftime('%Y%m%d%H%M%S')}"
        
        query = f"""
            INSERT INTO {self.database}.{self.schema}.SAVED_SCENARIOS (
                SCENARIO_ID, SCENARIO_NAME, CREATED_BY, CREATED_AT,
                PRODUCTION_DELTA_PCT, LEAD_TIME_VARIANCE_PCT, SAFETY_STOCK_ADJ_PCT,
                CASH_IMPACT_EUR, NOTES
            ) VALUES (
                %(scenario_id)s, %(name)s, %(created_by)s, CURRENT_TIMESTAMP(),
                %(production_delta)s, %(lead_time_variance)s, %(safety_stock_adj)s,
                %(cash_impact)s, %(notes)s
            )
        """
        
        self.execute_query(query, {
            'scenario_id': scenario_id,
            'name': scenario['SCENARIO_NAME'],
            'created_by': scenario.get('CREATED_BY', 'User'),
            'production_delta': scenario['PRODUCTION_DELTA_PCT'],
            'lead_time_variance': scenario['LEAD_TIME_VARIANCE_PCT'],
            'safety_stock_adj': scenario['SAFETY_STOCK_ADJ_PCT'],
            'cash_impact': scenario['CASH_IMPACT_EUR'],
            'notes': scenario.get('NOTES', ''),
        })
        
        return {'SCENARIO_ID': scenario_id, **scenario}

_service: Optional[SnowflakeService] = None

def get_snowflake_service() -> SnowflakeService:
    global _service
    if _service is None:
        _service = SnowflakeService()
    return _service

def close_snowflake_service():
    global _service
    if _service:
        _service.close()
        _service = None
