// Type definitions for aws-kcl
// Project: https://github.com/awslabs/amazon-kinesis-client-nodejs
// Definitions by: Russell van der Walt <https://github.com/rusvdw/>
// Definitions: https://github.com/borisyankov/DefinitelyTyped

declare module "aws-kcl" {
    
    module kcl {

        /**
         * The record processor must provide three functions:
         *
         * * `initialize` - called once
         * * `processRecords` - called zero or more times
         * * `shutdown` - called if this KCL instance loses the lease to this shard
         *
         * Notes:
         * * All of the above functions take additional callback arguments. When one is
         * done initializing, processing records, or shutting down, callback must be
         * called (i.e., `completeCallback()`) in order to let the KCL know that the
         * associated operation is complete. Without the invocation of the callback
         * function, the KCL will not proceed further.
         * * The application will terminate if any error is thrown from any of the
         * record processor functions. Hence, if you would like to continue processing
         * on exception scenarios, exceptions should be handled appropriately in
         * record processor functions and should not be passed to the KCL library. The
         * callback must also be invoked in this case to let the KCL know that it can
         * proceed further.
         */
        interface IRecordProcessor {

        
            // Called once by the KCL before any calls to processRecords. Any initialization logic for record processing can go here.
            // Must call completeCallback when finished initializing in order to proceed further.
            initialize(initializeInput: IInitializeInput, completeCallback: () => void): void;

            // Record processing logic. Note that if a checkpoint is invoked, only call completeCallback after the 
            // checkpoint operation is complete.
            processRecords(processRecordsInput: IProcessRecordsInput, completeCallback: () => void): void;

            // Called by KCL to indicate that this record processor should shut down. After shutdown operation is complete, there will not be any more calls to
            // any other functions of this record processor. Note that reason could be either TERMINATE or ZOMBIE. If ZOMBIE, clients should not
            // checkpoint because there is possibly another record processor which has acquired the lease for this shard. If TERMINATE, then
            // `checkpointer.checkpoint()` should be called to checkpoint at the end of the shard so that this processor will be shut down and new processors
            // will be created for the children of this shard.        
            shutdown(shutdownInput: IShutdownInput, completeCallback: () => void): void;
        }

        interface IInitializeInput {
            shardId: string;
        }

        interface IProcessRecordsInput {
            records: IRecord[];
            checkpointer: ICheckpointer;
        }

        interface IShutdownInput {
            reason: string; // TERMINATE | ZOMBIE
            checkpointer: ICheckpointer;
        }

        interface ICheckpointer {
            checkpoint(sequenceNumber: string, completeCallback: (err: string, checkpointedSequenceNumber: string) => void);
            checkpoint(completeCallback: (err: string) => void);
        }

        interface IRecord {

            data: string;
            partitionKey: string;
            sequenceNumber: string;

        }

        interface IKCLProcessor {

            run(): void;

        }


    }


    function kcl(recordProcessor: kcl.IRecordProcessor, inputFile?: string, outputFile?: string, errorFile?: string): kcl.IKCLProcessor;

    export = kcl;

}
