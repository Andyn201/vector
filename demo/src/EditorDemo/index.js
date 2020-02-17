import { Button, Icon } from "@blueprintjs/core";
import { generateSequenceData, tidyUpSequenceData } from "ve-sequence-utils";
import React from "react";
import { isRangeOrPositionWithinRange } from "ve-range-utils";

import store from "./../store";
import { updateEditor, actions } from "../../../src/";

import Editor from "../../../src/Editor";
import renderToggle from "./../utils/renderToggle";
import { setupOptions, setParamsIfNecessary } from "./../utils/setupOptions";
import exampleSequenceData from "./../exampleData/exampleSequenceData";
import AddEditFeatureOverrideExample from "./AddEditFeatureOverrideExample";
import exampleProteinData from "../exampleData/exampleProteinData";
import { connectToEditor } from "../../../src";

const MyCustomTab = connectToEditor(({ sequenceData = {} }) => {
  //you can optionally grab additional editor data using the exported connectToEditor function
  return {
    sequenceData
  };
})(function(props) {
  console.info("These are the props passed to our Custom Tab:", props);
  return (
    <div>
      <h3>Hello World, I am a Custom Tab</h3>
      <h4>sequenceLength: {props.sequenceData.sequence.length}</h4>
    </div>
  );
});

const defaultState = {
  hideSingleImport: false,
  readOnly: false,
  showMenuBar: true,
  customizeTabs: false,
  displayMenuBarAboveTools: true,
  withPreviewMode: false,
  disableSetReadOnly: false,
  showReadOnly: true,
  showCircularity: true,
  showGCContent: false,
  GCDecimalDigits: 1,
  overrideToolbarOptions: false,
  menuOverrideExample: false,
  propertiesOverridesExample: false,
  overrideRightClickExample: false,
  overrideAddEditFeatureDialog: false,
  clickOverridesExample: false,
  showAvailability: true,
  showDemoOptions: true,
  shouldAutosave: false,
  isFullscreen: false,
  isProtein: false,
  forceHeightMode: false,
  withVersionHistory: true,
  setDefaultVisibilities: false,
  onNew: true,
  onImport: true,
  onSave: true,
  onSaveAs: false,
  onRename: true,
  onDuplicate: true,
  onSelectionOrCaretChanged: false,
  onCreateNewFromSubsequence: false,
  onDelete: true,
  beforeSequenceInsertOrDelete: false,
  maintainOriginSplit: false,
  maxAnnotationsToDisplayAdjustment: false,
  onCopy: true,
  onPaste: true
};

export default class EditorDemo extends React.Component {
  constructor(props) {
    super(props);
    setupOptions({ that: this, defaultState, props });
    window.ove_updateEditor = vals => {
      updateEditor(store, "DemoEditor", vals);
    };
    updateEditor(store, "DemoEditor", {
      readOnly: false,
      sequenceData: ""
    });
  }
  componentDidUpdate() {
    setParamsIfNecessary({ that: this, defaultState });
  }

  changeFullscreenMode = e =>
    this.setState({
      isFullscreen: e.target.checked
    });
  changeReadOnly = e =>
    this.setState({
      readOnly: e.target.checked
    });

  propertiesOverridesExample = {
    PropertiesProps: {
      propertiesList: [
        { name: "Custom", Comp: MyCustomTab },
        "general",
        "features",
        {
          name: "parts",
          additionalFooterEls: (
            <Button
              onClick={() => {
                window.toastr.success("properties overrides successfull");
              }}
            >
              propertiesProps parts footer button
            </Button>
          )
        },
        "primers",
        "translations",
        "cutsites",
        "orfs",
        "genbank"
      ]
    }
  };
  rightClickOverridesExample = {
    rightClickOverrides: {
      partRightClicked: items => {
        return [
          ...items,
          {
            text: "My Part Override",
            onClick: () => window.toastr.success("Part Override Hit!")
          }
        ];
      }
    }
  };
  clickOverridesExample = {
    clickOverrides: {
      featureClicked: ({ event }) => {
        window.toastr.success("Feature Click Override Hit!");
        event.stopPropagation();
        return true; //returning truthy stops the regular click action from occurring
      },
      partClicked: () => {
        window.toastr.success("Part Click Override Hit!");
        //by default (aka returning falsy) the usual click action occurs
      }
    }
  };
  overrideAddEditFeatureDialogExample = {
    AddOrEditFeatureDialogOverride: AddEditFeatureOverrideExample
  };
  menuOverrideExample = {
    menuFilter:
      // Menu customization example
      menuDef => {
        menuDef.push({ text: "Custom", submenu: ["copy"] });
        menuDef[0].submenu
          .find(i => i.text && i.text.includes("Export"))
          .submenu.push({
            text: "Custom export option!",
            onClick: () => window.toastr.success("Custom export hit!")
          });
        menuDef[3].submenu.push({
          text: "My Custom Tool",
          onClick: () => window.toastr.success("Some custom tool")
        });
        return menuDef;
      }
  };
  toolbarOverridesExample = {
    ToolBarProps: {
      //name the tools you want to see in the toolbar in the order you want to see them
      toolList: [
        // 'saveTool',
        {
          name: "downloadTool",
          Icon: <Icon data-test="veDownloadTool" icon="bank-account" />,
          onIconClick: () => {
            window.toastr.success("Download tool hit!");
          }
        },
        {
          name: "undoTool",
          Icon: <Icon icon="credit-card" data-test="my-overridden-tool-123" />,
          onIconClick: () => {
            window.toastr.success("cha-ching");
          },
          disabled: false
        },
        "redoTool",
        "cutsiteTool",
        "featureTool",
        "oligoTool",
        "orfTool",
        "versionHistoryTool",
        {
          name: "alignmentTool",
          onIconClick: () => {
            const { item } = this.props;
            const url = "/alignments/new?seqId=" + item.id;
            window.open(window.location.origin + url);
          }
        },
        "editTool",
        "findTool",
        "visibilityTool"
      ]
    }
  };

  setLinearPanelAsActive = () => {
    store.dispatch(
      actions.setPanelAsActive("rail", { editorName: "DemoEditor" })
    );
  };

  render() {
    const {
      forceHeightMode,
      withVersionHistory,
      shouldAutosave,
      isFullscreen,
      withPreviewMode
    } = this.state;

    return (
      <React.Fragment>

        <div>
       
          <Editor
            panelMap={{
              myCustomTab: MyCustomTab
            }}
            style={{
              width: "100vw",
              height: "100vh",
            }}
            {...(this.state.readOnly && { readOnly: true })}
            editorName="DemoEditor"
            maxAnnotationsToDisplay={
              this.state.maxAnnotationsToDisplayAdjustment
                ? { features: 5 }
                : {}
            }
            showMenuBar={this.state.showMenuBar}
            hideSingleImport={this.state.hideSingleImport}
            displayMenuBarAboveTools={this.state.displayMenuBarAboveTools}
            {...(this.state.onNew && {
              onNew: () => window.toastr.success("onNew callback triggered")
            })}
            {...(this.state.onImport && {
              onImport: sequence => {
                window.toastr.success(
                  `onImport callback triggered for sequence: ${sequence.name}`
                );
                return sequence;
              }
            })}
            {...(this.state.onSave && {
              onSave: function(
                opts,
                sequenceDataToSave,
                editorState,
                onSuccessCallback
              ) {
                window.toastr.success("onSave callback triggered");
                console.info("opts:", opts);
                console.info("sequenceData:", sequenceDataToSave);
                console.info("editorState:", editorState);
                // To disable the save button after successful saving
                // either call the onSuccessCallback or return a successful promise :)
                onSuccessCallback();
                //or
                // return myPromiseBasedApiCall()
              }
            })}
            {...(this.state.onSaveAs && {
              onSaveAs: function(
                opts,
                sequenceDataToSave,
                editorState,
                onSuccessCallback
              ) {
                window.toastr.success("onSaveAs callback triggered");
                console.info("opts:", opts);
                console.info("sequenceData:", sequenceDataToSave);
                console.info("editorState:", editorState);
                // To disable the save button after successful saving
                // either call the onSuccessCallback or return a successful promise :)
                onSuccessCallback();
                //or
                // return myPromiseBasedApiCall()
              }
            })}
            {...(this.state.alwaysAllowSave && {
              alwaysAllowSave: true
            })}
            {...(this.state.onRename && {
              onRename: newName =>
                window.toastr.success("onRename callback triggered: " + newName)
            })}
            {...(this.state.onDuplicate && {
              onDuplicate: () =>
                window.toastr.success("onDuplicate callback triggered")
            })}
            {...(this.state.onSelectionOrCaretChanged && {
              onSelectionOrCaretChanged: ({ caretPosition, selectionLayer }) =>
                window.toastr.success(
                  `onSelectionOrCaretChanged callback triggered caretPosition:${caretPosition}    selectionLayer: start: ${selectionLayer.start} end:  ${selectionLayer.end} `
                )
            })}
            {...(this.state.onCreateNewFromSubsequence && {
              onCreateNewFromSubsequence: (selectedSeqData, props) => {
                console.info(selectedSeqData, props);
                window.toastr.success(
                  "onCreateNewFromSubsequence callback triggered"
                );
              }
            })}
            {...(this.state.onDelete && {
              onDelete: () =>
                window.toastr.success("onDelete callback triggered")
            })}
            {...(this.state.beforeSequenceInsertOrDelete && {
              beforeSequenceInsertOrDelete: (
                sequenceDataToInsert,
                existingSequenceData,
                caretPositionOrRange,
                options = {
                  maintainOriginSplit: this.state.maintainOriginSplit
                }
              ) => {
                window.toastr.info("beforeSequenceInsertOrDelete triggered");
                if (!sequenceDataToInsert.size) return; //if it is a delete, just return early
                return {
                  //override the sequenceDataToInsert
                  sequenceDataToInsert: {
                    ...sequenceDataToInsert,
                    parts: [
                      ...sequenceDataToInsert.parts,
                      {
                        name: "CHANGED_SEQUENCE",
                        start: 0,
                        end: sequenceDataToInsert.size - 1
                      }
                    ]
                  },
                  //override the existingSequenceData
                  existingSequenceData: {
                    ...existingSequenceData,
                    ...["parts", "features", "primers"].reduce((acc, key) => {
                      const annotations = existingSequenceData[key];
                      acc[key] = annotations.filter(
                        a =>
                          !isRangeOrPositionWithinRange(
                            caretPositionOrRange,
                            a,
                            existingSequenceData.size
                          )
                      );
                      return acc;
                    }, {})
                  },
                  options
                };
              }
            })}
            {...(this.state.onCopy && {
              onCopy: function(/* event, copiedSequenceData, editorState */) {
                window.toastr.success("onCopy callback triggered");

                // console.info(editorState);
                // //the copiedSequenceData is the subset of the sequence that has been copied in the teselagen sequence format
                // const clipboardData = event.clipboardData;
                // clipboardData.setData(
                //   "text/plain",
                //   copiedSequenceData.sequence
                // );
                // clipboardData.setData(
                //   "application/json",
                //   //for example here you could change teselagen parts into jbei parts
                //   JSON.stringify(copiedSequenceData)
                // );
                // event.preventDefault();
                //in onPaste in your app you can do:
                // e.clipboardData.getData('application/json')
              }
            })}
            {...(this.state.onPaste && {
              onPaste: function(event /* editorState */) {
                //the onPaste here must return sequenceData in the teselagen data format
                window.toastr.success("onPaste callback triggered");
                const clipboardData = event.clipboardData;
                let jsonData = clipboardData.getData("application/json");
                if (jsonData) {
                  jsonData = JSON.parse(jsonData);
                  if (jsonData.isJbeiSeq) {
                    jsonData = exampleConversion(jsonData);
                  }
                }
                const sequenceData = jsonData || {
                  sequence: clipboardData.getData("text/plain")
                };
                return sequenceData;
              }
            })}
            handleFullscreenClose={
              !withPreviewMode && this.changeFullscreenMode
            } //don't pass this handler if you're also using previewMode
            isFullscreen={isFullscreen}
            // handleFullscreenClose={() => {
            //   console.info("ya");
            // }} //don't pass this handler if you're also using previewMode
            shouldAutosave={shouldAutosave}
            {...(forceHeightMode && { height: 500 })}
            {...(withVersionHistory && {
              getSequenceAtVersion: versionId => {
                if (versionId === 2) {
                  return {
                    sequence: "thomaswashere"
                  };
                } else if ((versionId = 3)) {
                  return {
                    features: [{ start: 4, end: 6 }],
                    sequence:
                      "GGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacaccccccGGGAAAagagagtgagagagtagagagagaccacacccccc"
                  };
                } else {
                  console.error("we shouldn't be here...");
                  return {
                    sequence: "taa"
                  };
                }
              },
              getVersionList: () => {
                return [
                  {
                    dateChanged: "12/30/2211",
                    editedBy: "Nara",
                    // revisionType: "Sequence Deletion",
                    versionId: 2
                  },
                  {
                    dateChanged: "8/30/2211",
                    editedBy: "Ralph",
                    // revisionType: "Feature Edit",
                    versionId: 3
                  }
                ];
              }
            })}
            withPreviewMode={withPreviewMode}
            disableSetReadOnly={this.state.disableSetReadOnly}
            showReadOnly={this.state.showReadOnly}
            showCircularity={this.state.showCircularity}
            showGCContent={this.state.showGCContent}
            GCDecimalDigits={this.state.GCDecimalDigits}
            showAvailability={this.state.showAvailability}
            maintainOriginSplit={
              this.state.beforeSequenceInsertOrDelete
                ? this.state.maintainOriginSplit
                : false
            }
            {...(this.state.overrideRightClickExample &&
              this.rightClickOverridesExample)}
            {...(this.state.overrideAddEditFeatureDialog &&
              this.overrideAddEditFeatureDialogExample)}
            {...(this.state.clickOverridesExample &&
              this.clickOverridesExample)}
            {...(this.state.propertiesOverridesExample &&
              this.propertiesOverridesExample)}
            {...(this.state.overrideToolbarOptions &&
              this.toolbarOverridesExample)}
            {...(this.state.menuOverrideExample && this.menuOverrideExample)}
          />
          {/* </div> */}
        </div>
      </React.Fragment>
    );
  }
}

function exampleConversion(seq) {
  return seq;
}
