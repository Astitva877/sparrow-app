/* eslint-disable @typescript-eslint/no-explicit-any */
import { RxDB, type EnvironmentTabDocument } from "$lib/database/app.database";
import type { Observable } from "rxjs";

export class EnvironmentTabRepository {
  constructor() {}

  /**
   * Creates a new environment tab.
   */
  public createTab = async (
    environmentTab: any,
    workspaceId: string,
  ): Promise<void> => {
    const existedTab = await RxDB.getInstance()
      .rxdb.environmenttab.findOne({
        selector: {
          id: environmentTab.id,
        },
      })
      .exec();
    const activeTab = await RxDB.getInstance()
      .rxdb.environmenttab.findOne({
        selector: {
          isActive: true,
          workspaceId,
        },
      })
      .exec();
    if (activeTab) {
      await activeTab.incrementalUpdate({ $set: { isActive: false } });
    }
    if (existedTab) {
      await existedTab.incrementalUpdate({ $set: { isActive: true } });
    } else {
      await RxDB.getInstance().rxdb.environmenttab.insert(environmentTab);
    }
  };

  /**
   * delete environment tab.
   */
  public deleteEnvironmentTab = async (
    environmentId: string,
  ): Promise<boolean> => {
    const existedTab = await RxDB.getInstance()
      .rxdb.environmenttab.findOne({
        selector: {
          id: environmentId,
        },
      })
      .exec();
    const del = existedTab;
    if (existedTab) {
      await existedTab.remove();
    }
    return [del?.get("isActive"), del?.get("workspaceId")];
  };

  /**
   * Extracts all data of the active environment tab.
   */
  public getEnvironmentTab = (
    workspaceId,
  ): Observable<EnvironmentTabDocument> => {
    return RxDB.getInstance().rxdb.environmenttab.findOne({
      selector: {
        isActive: true,
        workspaceId,
      },
    }).$;
  };

  /**
   * Responsible to change environment tab property like :
   * id, name, description, save.
   */
  public setEnvironmentTabProperty = async (
    data: any,
    route: string,
    id: string,
  ): Promise<void> => {
    const query = await RxDB.getInstance()
      .rxdb.environmenttab.findOne({
        selector: {
          id,
        },
      })
      .exec();
    if (query) {
      query.incrementalModify((value: any) => {
        value[route] = data;
        if (route === "name" || route === "variable") {
          value["isSave"] = false;
        }
        return value;
      });
    }
  };

  /**
   * Extracts an active environment tab.
   */
  public getActiveEnvironmentTab = async (
    workspaceId,
  ): EnvironmentTabDocument => {
    return await RxDB.getInstance()
      .rxdb.environmenttab.findOne({
        selector: {
          isActive: true,
          workspaceId,
        },
      })
      .exec();
  };

  /**
   * remove environment tab by workspaceId
   */
  public removeEnvironmentTabs = async (_workspaceId: string): Promise<any> => {
    return await RxDB.getInstance()
      .rxdb.environmenttab.find({
        selector: {
          workspaceId: _workspaceId,
        },
      })
      .remove();
  };
}
