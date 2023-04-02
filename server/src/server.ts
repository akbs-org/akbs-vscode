import {
    createConnection,
    TextDocuments,
    ProposedFeatures,
    InitializeParams,
    CompletionItem,
    TextDocumentPositionParams,
    TextDocumentSyncKind,
    InitializeResult,
    Range
} from 'vscode-languageserver/node';

import {
    Position,
    TextDocument
} from 'vscode-languageserver-textdocument';

// Create a connection for the server, using Node's IPC as a transport.
// Also include all preview / proposed LSP features.
const connection = createConnection(ProposedFeatures.all);

// Create a simple text document manager.
const documents: TextDocuments<TextDocument> = new TextDocuments(TextDocument);

let hasConfigurationCapability = false;
let hasWorkspaceFolderCapability = false;
let hasDiagnosticRelatedInformationCapability = false;

connection.onInitialize((params: InitializeParams) => {

    const capabilities = params.capabilities;

    // Does the client support the `workspace/configuration` request?
    // If not, we fall back using global settings.
    hasConfigurationCapability = !!(
        capabilities.workspace && !!capabilities.workspace.configuration
    );
    hasWorkspaceFolderCapability = !!(
        capabilities.workspace && !!capabilities.workspace.workspaceFolders
    );
    hasDiagnosticRelatedInformationCapability = !!(
        capabilities.textDocument &&
        capabilities.textDocument.publishDiagnostics &&
        capabilities.textDocument.publishDiagnostics.relatedInformation
    );

    const result: InitializeResult = {
        capabilities: {
            textDocumentSync: TextDocumentSyncKind.Incremental,
            // Tell the client that this server supports code completion.
            completionProvider: {
                resolveProvider: true
            },
            hoverProvider: true
        }
    };
    if (hasWorkspaceFolderCapability) {
        result.capabilities.workspace = {
            workspaceFolders: {
                supported: true
            }
        };
    }
    return result;
});


// This handler provides the initial list of the completion items.
connection.onCompletion(
    (textDocumentPosition: TextDocumentPositionParams): CompletionItem[] => {
        // The pass parameter contains the position of the text document in
        // which code complete got requested. For the example we ignore this
        // info and always provide the same completion items.
        const textDoc = documents.get(textDocumentPosition.textDocument.uri);
        if (!textDoc) {
            return [];
        }
        const startOfLine: Position = { line: textDocumentPosition.position.line, character: 0 };
        const text = textDoc.getText(Range.create(startOfLine, textDocumentPosition.position));
        let index = 0;
        let func = (label: string): CompletionItem => ({ kind: 3, data: index++, label });
        let vars = (label: string): CompletionItem => ({ kind: 6, data: index++, label });
        if (!text.includes('(')) {
            return [
                func('set'),
                func('compile'),
                func('print'),
                func('exit'),
                func('check_for'),
                func('if'),
                func('endif')
            ];
        }
        else {
            index += 7;
            if (text.substring(Math.max(text.lastIndexOf('('), text.lastIndexOf(',')) + 1).trim().charAt(0) === '$') {
                index += 14;
                return [
                    vars("PLATFORM"),
                    vars("ARCH"),
                    vars("C_COMPILER"),
                    vars("CXX_COMPILER"),
                    vars("ASM_INTEL_COMPILER"),
                    vars("ASM_ATT_COMPILER"),
                    vars("SHARED_COMPILER"),
                    vars("STATIC_COMPILER"),
                    vars("OUTPUT"),
                    vars("C_STD"),
                    vars("CXX_STD"),
                    vars("BUILD_DIR"),
                    vars("OUTPUT_DIR"),
                    vars("C_FLAGS"),
                    vars("CXX_FLAGS"),
                    vars("ASM_INTEL_FLAGS"),
                    vars("SHARED_FLAGS"),
                    vars("STATIC_FLAGS"),
                ];
            } else {
                return [
                    func("wildcard$"),
                    func("remove$"),
                    func("replace$"),
                    func("eq$"),
                    func("neq$"),
                    func("gt$"),
                    func("lt$"),
                    func("gte$"),
                    func("lte$"),
                    func("set$"),
                    func("notset$"),
                    func("and$"),
                    func("or$"),
                    func("not$"),

                ];
            }
        }

    }
);

// This handler resolves additional information for the item selected in
// the completion list.
connection.onCompletionResolve(
    (item: CompletionItem): CompletionItem => {
        item.documentation = [
            'The set function is used to set a variable to a certain value',
            'The compile function is used to tell AKBS to start compiling the executable/library',
            'The print function is used to send some data to stdout',
            'The exit function is used to exit with a certain error code (defaulting to 0)',
            'The check_for function is used to check for the compilers of supported languages (C, CXX or ASM for now)',
            'The if function is used to check whether a certain condition is true or false',
            'The endif statement is used to end an if function',
            'The wildcard$ wildcard function evaluates a list of space separated globs into a space separated list of files',
            'The remove$ wildcard function removes the second argument onwards from a space separated list of strings',
            'The replace$ wildcard function replaces the even arguments (second, fourth, ...) with the odd arguments (third, fifth, ...) in the first argument',
            'The eq$ wildcard function checks if two strings are equal',
            'The neq$ wildcard function checks if two strings are unequal',
            'The gt$ wildcard function checks if the first argument is greater than the second argument',
            'The lt$ wildcard function checks if the first argument is lesser than the second argument',
            'The gte$ wildcard function checks if the first argument is greater than or equal to the second argument',
            'The lte$ wildcard function checks if the first argument is lesser than or equal to the second argument',
            'The set$ wildcard function checks if the variable exists',
            'The notset$ wildcard function checks if the variable does not exist',
            'The and$ wildcard function ANDs all the boolean arguments together',
            'The or$ wildcard function ORs all the boolean arguments together',
            'The not$ wildcard function NOTs the argument passed to it',
            'The $PLATFORM variable is the equivalent of Python\'s os.name',
            'The $ARCH variable stores the architecture of the system',
            'The $C_COMPILER variable stores the C compiler location set by check_for',
            'The $CXX_COMPILER variable stores the C++ compiler location set by check_for',
            'The $ASM_INTEL_COMPILER variable stores the Intel Assembly assembler location set by check_for',
            'The $ASM_ATT_COMPILER variable stores the AT&T Assembly assembler location set by check_for',
            'The $SHARED_COMPILER variable stores the linker location for shared libraries set by check_for',
            'The $STATIC_COMPILER variable stores the linker location for static libraries set by check_for',
            'The $OUTPUT variable stores the output file generated by linking',
            'The $C_STD variable stores the C std used (17, 11, etc.)',
            'The $CXX_STD variable stores the C std used (17, 11, etc.)',
            'The $BUILD_DIR variable stores the directory to build the objects in',
            'The $OUTPUT_DIR variable stores the directory to output the finished library/executable in',
            'The $C_FLAGS variable stores the flags passed to the C compiler',
            'The $CXX_FLAGS variable stores the flags passed to the C++ compiler',
            'The $ASM_INTEL_FLAGS variable stores the flags passed to the Intel Assembly assembler',
            'The $ASM_ATT_FLAGS variable stores the flags passed to the AT&T Assembly assembler',
            'The $SHARED_FLAGS variable stores the flags passed to the shared library linker',
            'The $STATIC_FLAGS variable stores the flags passed to the static library linker',
        ][item.data];
        item.detail = [
            "set(<VARIABLE>, <VALUE>)",
            "compile(<STATIC|SHARED>, <FILES>)",
            "print([DATA])",
            "exit([CODE])",
            "check_for(<LANGUAGE1>, [LANGUAGE2], ...)",
            "if(true)\n...\nendif",
            "if(true)\n...\nendif",
            "wildcard$(<GLOB>)",
            "remove$(<STRINGS>, <STR1>, [STR2], ...)",
            "replace$(<STRING>, <STR1>, <STR2>, [STR3], [STR4], ...)",
            "eq$(<STR1>, <STR2>)",
            "neq$(<STR1>, <STR2>)",
            "gt$(<ARG1>, <ARG2>)",
            "lt$(<ARG1>, <ARG2>)",
            "gte$(<ARG1>, <ARG2>)",
            "lte$(<ARG1>, <ARG2>)",
            "set$(<VARIABLE>)",
            "notset$(<VARIABLE>)",
            "and$(<ARG1>, <ARG2>, [ARG3], ...)",
            "or$(<ARG1>, <ARG2>, [ARG3], ...)",
            "not$(<ARG1>)"


        ][item.data];

        return item;
    }
);

// Make the text document manager listen on the connection
// for open, change and close text document events
documents.listen(connection);

// Listen on the connection
connection.listen();