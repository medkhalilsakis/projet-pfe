import { Exigence }               from './exigence.model';
import { AnalyseFaisabilite }     from './analyse-faisabilite.model';
import { CahierDesCharges }       from './cahier-des-charges.model';
import { PlanificationPhase }     from './planification-phase.model';
import { Tache } from '../tache.model';

export interface InitiationPhase {
  id?: number;
  tache?: { id: number };
  introduction?: string;
  objectifs?: string;
  exigences?: Exigence[];
  faisabilite?: AnalyseFaisabilite;
  cahierDesCharges?: CahierDesCharges;
  plannings?: PlanificationPhase[];
}
