import { Exigence }               from './exigence.model';
import { AnalyseFaisabilite }     from './analyse-faisabilite.model';
import { CahierDesCharges }       from './cahier-des-charges.model';
import { PlanificationPhase }     from './planification-phase.model';

export interface InitiationPhase {
  id?: number;
  introduction?: string;
  objectifs?: string;
  exigences?: Exigence[];
  faisabilite?: AnalyseFaisabilite;
  cahierDesCharges?: CahierDesCharges;
  plannings?: PlanificationPhase[];
}
