import logging

from sqlalchemy import and_, false
from sqlalchemy.exc import IntegrityError

from rest_api.rest_api_server.controllers.base import BaseController
from rest_api.rest_api_server.controllers.base_async import BaseAsyncControllerWrapper
from rest_api.rest_api_server.models.models import Checklist, Organization, CloudAccount

LOG = logging.getLogger(__name__)


class ChecklistController(BaseController):
    def _get_model_type(self):
        return Checklist

    def get_by_organization(self, organization_id):
        def get(org_id):
            return self.session.query(self.model_type).filter(and_(
                self.model_type.deleted_at.is_(False),
                self.model_type.organization_id == org_id
            )).first()

        checklist = get(organization_id)
        if not checklist:
            checklist = Checklist(organization_id=organization_id)
            try:
                self.session.add(checklist)
                self.session.commit()
            except IntegrityError as ex:
                LOG.exception('Failed to create checklist: %s', str(ex))
                self.session.rollback()
                checklist = get(organization_id)
        return checklist

    def schedule_next_run(self, organization_id, next_run=1):
        checklist = self.get_by_organization(organization_id)
        self.update(checklist.id, next_run=next_run)

    def list(self, **kwargs):
        org_checklist_set = self.session.query(
            Organization.id, Checklist
        ).outerjoin(
            Checklist, and_(
                Checklist.deleted.is_(False),
                Checklist.organization_id == Organization.id
            )
        ).filter(
            and_(
                Organization.deleted.is_(False),
                Organization.is_demo.is_(false())
            )
        ).all()
        org_with_cloud_accs = [x[0] for x in self.session.query(
            CloudAccount.organization_id).filter(
            CloudAccount.deleted.is_(False)).distinct(
            CloudAccount.organization_id).all()]
        checklists = []
        checklists_to_delete = []
        missing_org_ids = set()
        for organization_id, checklist in org_checklist_set:
            if checklist and organization_id in org_with_cloud_accs:
                checklists.append(checklist)
            elif not checklist and organization_id in org_with_cloud_accs:
                missing_org_ids.add(organization_id)
            elif checklist and organization_id not in org_with_cloud_accs:
                checklists_to_delete.append(checklist)
        new_checklists = []
        for org_id in missing_org_ids:
            checklist = Checklist(organization_id=org_id)
            self.session.add(checklist)
            new_checklists.append(checklist)
        for checklist in checklists_to_delete:
            self.session.delete(checklist)
        try:
            self.session.commit()
            checklists.extend(new_checklists)
        except IntegrityError as ex:
            LOG.exception('Failed to create checklists: %s', str(ex))
            self.session.rollback()
        return checklists


class ChecklistAsyncController(BaseAsyncControllerWrapper):
    def _get_controller_class(self):
        return ChecklistController
